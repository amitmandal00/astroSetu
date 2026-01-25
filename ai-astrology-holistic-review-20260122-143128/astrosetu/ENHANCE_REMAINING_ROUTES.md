# Remaining Routes to Enhance

## Report Routes (11 routes)
All report routes need:
- Rate limiting
- Request size validation
- Input validation
- Error handling

Pattern to apply:
```typescript
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { BirthDetailsSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/[route-name]');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 50 * 1024); // 50KB max
    
    // Parse and validate request body
    const json = await parseJsonBody(req);
    
    // Validate based on route requirements
    // ... route-specific validation
    
    // ... existing logic
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Routes to enhance:
1. /api/reports/lalkitab
2. /api/reports/varshphal
3. /api/reports/sadesati
4. /api/reports/love
5. /api/reports/dasha-phal
6. /api/reports/mangal-dosha
7. /api/reports/general
8. /api/reports/gochar
9. /api/reports/babyname
10. /api/reports/pdf
11. /api/astrologers/[id]

