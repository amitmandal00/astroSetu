"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User, BirthDetails } from "@/types/astrology";
import { apiGet, apiPost, apiPost as apiPatch } from "@/lib/http";
import { session } from "@/lib/session";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { TimePicker } from "@/components/ui/TimePicker";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [birthData, setBirthData] = useState<BirthDetails>({ dob: "", tob: "", place: "" });
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    // Check local session first
    const localUser = session.getUser();
    if (localUser) {
      setUser(localUser);
      setFormData({
        name: localUser.name,
        email: localUser.email,
        phone: localUser.phone || ""
      });
      if (localUser.birthDetails) {
        setBirthData(localUser.birthDetails);
      }
      setLoading(false);
      return;
    }

    // If no local session, check server
    apiGet<{ ok: boolean; data?: User; error?: string }>("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          if (res.error === "Not authenticated") {
            router.push("/login?redirect=/profile");
            return;
          }
          throw new Error(res.error || "Failed");
        }
        if (res.data) {
          session.save(res.data);
          setUser(res.data);
          setFormData({
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone || ""
          });
          if (res.data.birthDetails) {
            setBirthData(res.data.birthDetails);
          }
        }
      })
      .catch((e) => {
        setErr(e?.message ?? "Something went wrong");
        router.push("/login?redirect=/profile");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleUpdate() {
    setErr(null);
    setSuccess(null);
    setLoading(true);
    try {
      // Get current user for userId and email
      const currentUser = session.getUser();
      
      // Use PATCH method explicitly
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email, // Include email for demo mode
          userId: currentUser?.id, // Include userId for demo mode
        }),
      });

      const data = await res.json();
      
      if (!data.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      if (data.data) {
        // Update session
        session.updateUser(data.data);
        // Update local state
        setUser(data.data);
        setFormData({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone || "",
        });
        setEditing(false);
        // Show success message
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await apiPost("/api/auth/logout", {});
      session.clear();
      router.push("/login");
    } catch (e: any) {
      console.error("Logout error:", e);
      session.clear();
      router.push("/login");
    }
  }

  async function handleSaveBirthDetails() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(birthData)
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      
      // Save to session as well for personalization
      session.saveBirthDetails(birthData);
      
      setUser(data.data);
      setSuccess("Birth details saved successfully! Forms will be pre-filled with this data.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setErr(e?.message ?? "Save failed");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="Loading..." />
        <CardContent>Loading your profile...</CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader title="Not Found" />
        <CardContent>
          <div className="text-sm text-rose-700">{err || "User not found"}</div>
          <Button className="mt-4" onClick={() => router.push("/login")}>Go to Login</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader eyebrow="Profile" title="My Account" subtitle="Manage your profile and birth details." />
        <CardContent className="grid gap-4">
          {!editing ? (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Name</div>
                  <div className="text-sm font-semibold">{user.name}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-1">Email</div>
                  <div className="text-sm font-semibold">{user.email}</div>
                </div>
                {user.phone && (
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-1">Phone</div>
                    <div className="text-sm font-semibold">{user.phone}</div>
                  </div>
                )}
              </div>
              <Button onClick={() => setEditing(true)} variant="secondary">Edit Profile</Button>
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Name</div>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Email</div>
                  <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Phone</div>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleUpdate} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button onClick={() => {
                  setEditing(false);
                  setErr(null);
                  setSuccess(null);
                  // Reset form data to original values
                  if (user) {
                    setFormData({
                      name: user.name,
                      email: user.email,
                      phone: user.phone || "",
                    });
                  }
                }} variant="secondary" disabled={loading}>
                  Cancel
                </Button>
              </div>
            </>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 text-sm">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>{success}</span>
              </div>
            </div>
          )}
          {err && (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-sm">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{err}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader eyebrow="Birth Details" title="My Birth Information" subtitle="Save your birth details for quick access to services." />
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Date of Birth</div>
              <Input
                type="date"
                value={birthData.dob}
                onChange={(e) => setBirthData({ ...birthData, dob: e.target.value })}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Time of Birth</div>
              <TimePicker
                value={birthData.tob}
                onChange={(value) => setBirthData({ ...birthData, tob: value })}
                placeholder="HH:mm"
                showSeconds={false}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Place</div>
              <AutocompleteInput
                value={birthData.place}
                onChange={(value) => setBirthData({ ...birthData, place: value })}
                placeholder="Enter city name (e.g., Mumbai, Delhi)"
                prioritizeIndia={true}
              />
            </div>
          </div>
          <Button onClick={handleSaveBirthDetails} disabled={loading || !birthData.dob || !birthData.tob || !birthData.place}>
            {loading ? "Saving..." : "Save Birth Details"}
          </Button>
          {user.birthDetails && (
            <div className="mt-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50">
              <div className="text-xs font-semibold text-emerald-700 mb-2">Saved Details</div>
              <div className="text-sm text-emerald-800">
                {user.birthDetails.dob} at {user.birthDetails.tob} in {user.birthDetails.place}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader 
          eyebrow="🔐 Security" 
          title="Two-Factor Authentication" 
          subtitle="Add an extra layer of security to your account"
        />
        <CardContent className="space-y-4">
          {show2FASetup ? (
            <TwoFactorSetup
              onComplete={() => {
                setShow2FASetup(false);
                setTwoFactorEnabled(true);
              }}
              onCancel={() => setShow2FASetup(false)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                <div>
                  <div className="font-semibold text-slate-900 mb-1">
                    {twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                  </div>
                  <div className="text-xs text-slate-600">
                    {twoFactorEnabled 
                      ? "Your account is protected with two-factor authentication"
                      : "Enable 2FA to secure your account with authenticator apps"
                    }
                  </div>
                </div>
                <Badge tone={twoFactorEnabled ? "green" : "neutral"}>
                  {twoFactorEnabled ? "✓ Active" : "Inactive"}
                </Badge>
              </div>
              {!twoFactorEnabled ? (
                <Button onClick={() => setShow2FASetup(true)} className="w-full">
                  🔐 Setup Two-Factor Authentication
                </Button>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                  <div className="text-sm text-emerald-800 mb-2">
                    ✓ Two-factor authentication is active
                  </div>
                  <div className="text-xs text-emerald-700">
                    You&apos;ll be asked for a verification code when logging in
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader 
          eyebrow="🔔 Notifications" 
          title="Push Notifications" 
          subtitle="Manage your notification preferences and weekly insights"
        />
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-slate-900">Weekly Insights</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Receive gentle astrological insights every week
                  </div>
                </div>
              </div>
            </div>
            <Link href="/notifications/settings">
              <Button className="w-full">
                🔔 Manage Notification Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Saved Kundlis */}
      {session.getSavedKundlis().length > 0 && (
        <Card>
          <CardHeader eyebrow="📊 Saved Kundlis" title="My Kundli Reports" subtitle="Quick access to your saved Kundli reports" />
          <CardContent className="space-y-3">
            {session.getSavedKundlis().slice(0, 5).map((kundli, index) => (
              <div
                key={kundli.id || index}
                className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => {
                  // Pre-populate form and navigate to Kundli page
                  if (kundli.birthDetails) {
                    const bd = kundli.birthDetails;
                    const params = new URLSearchParams({
                      name: bd.name || "",
                      day: bd.day?.toString() || "",
                      month: bd.month?.toString() || "",
                      year: bd.year?.toString() || "",
                      hours: bd.hours?.toString() || "",
                      minutes: bd.minutes?.toString() || "",
                      place: bd.place || "",
                    });
                    window.location.href = `/kundli?${params.toString()}`;
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{kundli.name || `Kundli ${index + 1}`}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {kundli.birthDetails?.place || "Unknown Place"} • {kundli.ascendant || "N/A"} Ascendant
                    </div>
                    {kundli.savedAt && (
                      <div className="text-xs text-slate-500 mt-1">
                        Saved {new Date(kundli.savedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge>{kundli.rashi || "N/A"}</Badge>
                </div>
              </div>
            ))}
            {session.getSavedKundlis().length > 5 && (
              <div className="text-xs text-slate-500 text-center">
                +{session.getSavedKundlis().length - 5} more Kundlis
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader eyebrow="Quick Actions" title="Saved Items" />
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Saved Kundlis</div>
              <div className="text-sm text-slate-700">
                {session.getSavedKundlis().length || 0} saved
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">Saved Matches</div>
              <div className="text-sm text-slate-700">
                {user.savedMatches?.length || 0} saved
              </div>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleLogout}
            className="w-full border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            🚪 Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

