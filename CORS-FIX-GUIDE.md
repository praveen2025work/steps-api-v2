# Guide to Resolving the CORS `cache-control` Header Issue

## 1. The Problem: What is Happening?

The application is experiencing a Cross-Origin Resource Sharing (CORS) error. This is a security feature built into web browsers that prevents a web page from making requests to a different domain (or "origin") than the one it came from.

The specific error is:
**`Access to fetch at '...' has been blocked by CORS policy: Request header field cache-control is not allowed by Access-Control-Allow-Headers in preflight response.`**

Here’s what it means in simple terms:
1.  **Preflight Check:** Before the application can send its actual `GET` request to the API, the browser sends a "preflight" request (using the `OPTIONS` method) to ask the server for permission.
2.  **Asking for Permission:** In this preflight request, the browser tells the server which headers the actual request will contain. In our case, the browser is automatically including the `cache-control` header.
3.  **Server Rejection:** The API server is responding that `cache-control` is **not** on its list of allowed headers. Because permission was denied, the browser blocks the actual `GET` request from ever being sent, and the application fails to load the data.

**Conclusion:** This is a **server-side configuration issue**. The front-end application code is correct, but the server's security policy is too restrictive. No further changes to the front-end code can solve this.

---

## 2. The Solution: How to Fix It

The backend team needs to update the server's CORS configuration to explicitly allow the `cache-control` header.

The server must be configured to include `cache-control` in the `Access-Control-Allow-Headers` response header for all preflight (`OPTIONS`) requests.

**The Required Header Value:**

The `Access-Control-Allow-Headers` response header should contain, at a minimum:
`Origin, X-Requested-With, Content-Type, Accept, Authorization, cache-control`

---

## 3. Implementation Examples for Backend Teams

The application interacts with both Java and .NET APIs. Here are implementation examples for both platforms.

### For the Java (Spring Boot) API

The team managing the Java API (`http://pcportal-workflowsubmission-api-uat.intranet.barcapint.com/api/`) should update their CORS configuration.

A common way to do this in Spring Boot is with a `WebMvcConfigurer` bean.

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Apply to all endpoints
                        .allowedOrigins("http://localhost:4200", "https://*.preview.co.dev") // Add your front-end origins
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders(
                            "Origin", 
                            "X-Requested-With", 
                            "Content-Type", 
                            "Accept", 
                            "Authorization", 
                            "cache-control" // <-- THE CRITICAL ADDITION
                        ) 
                        .allowCredentials(false); // Set to false as per our service configuration
            }
        };
    }
}
```

### For the .NET Core API

The team managing the .NET API should update their CORS policy in `Startup.cs` or `Program.cs`.

**Using `Program.cs` (Modern .NET 6+):**

```csharp
var builder = WebApplication.CreateBuilder(args);

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:4200", "https://*.preview.co.dev") // Add your front-end origins
                                .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .WithHeaders(
                                    "Origin", 
                                    "X-Requested-With", 
                                    "Content-Type", 
                                    "Accept", 
                                    "Authorization", 
                                    "cache-control" // <-- THE CRITICAL ADDITION
                                );
                      });
});

// ... other services

var app = builder.Build();

// ... other middleware

app.UseCors(MyAllowSpecificOrigins);

app.MapControllers();

app.Run();
```

---

## 4. Next Steps

Please provide this guide to your backend development or server administration team. Once they have updated the server's CORS policy to include `cache-control` in the allowed headers, this issue will be resolved.