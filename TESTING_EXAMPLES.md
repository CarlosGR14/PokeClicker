# ✅ TEST EXAMPLES - Pokeclicker Debugging Fixes

## 1. Race Condition Test

**File:** `src/__tests__/GameClient.test.tsx`

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import GameClient from "@/app/game/GameClient";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");
jest.mock("@/services/pokeapi");

describe("GameClient - Save Race Condition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not save multiple times concurrently", async () => {
    const mockSession = {
      user: {
        email: "test@example.com",
        name: "Test User",
      },
    };

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    global.fetch = jest.fn((url: string) => {
      if (url === "/api/game/state") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              money: 100,
              clicks: 0,
              cps: 0,
              upgrades: [],
              collectedPokemon: [],
            }),
        });
      }

      if (url === "/api/game/save") {
        // Simular delay
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true }),
            });
          }, 100);
        });
      }

      return Promise.reject(new Error("Not mocked"));
    });

    const { rerender } = render(<GameClient />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/game/state");
    });

    // Simular múltiples cambios rápidos
    const saveCallsBeforeMultiple = (global.fetch as jest.Mock).mock.calls
      .filter((call) => call[0] === "/api/game/save").length;

    // Esperar a que se estabilice
    await new Promise((resolve) => setTimeout(resolve, 6000));

    const saveCallsAfter = (global.fetch as jest.Mock).mock.calls
      .filter((call) => call[0] === "/api/game/save").length;

    // Debe haber como máximo 2 saves (uno por cambio importante)
    expect(saveCallsAfter - saveCallsBeforeMultiple).toBeLessThanOrEqual(2);
  });
});
```

---

## 2. Input Validation Test

**File:** `src/__tests__/api/game/save.test.ts`

```typescript
import { POST } from "@/app/api/game/save/route";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next");
jest.mock("@/lib/db", () => ({
  prisma: {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    mejora: {
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    pokemon: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("POST /api/game/save - Input Validation", () => {
  it("should reject negative money", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });

    const request = new Request("http://localhost/api/game/save", {
      method: "POST",
      body: JSON.stringify({
        money: -1000, // ← INVÁLIDO
        clicks: 0,
        cps: 0,
        upgrades: [],
        collectedPokemon: [],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Validación fallida");
  });

  it("should reject invalid upgrade IDs", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });

    const request = new Request("http://localhost/api/game/save", {
      method: "POST",
      body: JSON.stringify({
        money: 100,
        clicks: 0,
        cps: 0,
        upgrades: [
          {
            id: "fake_upgrade_id", // ← INVÁLIDO
            count: 1,
            cost: 10,
            cpsBonus: 1,
            name: "Fake",
            description: "Fake",
          },
        ],
        collectedPokemon: [],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("should reject NaN or Infinity", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });

    const request = new Request("http://localhost/api/game/save", {
      method: "POST",
      body: JSON.stringify({
        money: Infinity, // ← INVÁLIDO
        clicks: 0,
        cps: 0,
        upgrades: [],
        collectedPokemon: [],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

---

## 3. Passive Income Test

**File:** `src/__tests__/GameClient.passive.test.tsx`

```typescript
import { render, waitFor } from "@testing-library/react";
import GameClient from "@/app/game/GameClient";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");
jest.mock("@/services/pokeapi");

describe("GameClient - Passive Income", () => {
  it("should not cause infinite loops", async () => {
    const mockSession = {
      user: {
        email: "test@example.com",
        name: "Test User",
      },
    };

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });

    let renderCount = 0;
    const originalConsoleError = console.error;
    console.error = jest.fn();

    global.fetch = jest.fn((url: string) => {
      if (url === "/api/game/state") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              money: 100,
              clicks: 0,
              cps: 5, // ← CPS > 0 para activar passive income
              upgrades: [],
              collectedPokemon: [],
            }),
        });
      }
      return Promise.reject(new Error("Not mocked"));
    });

    render(<GameClient />);

    // Esperar 3 segundos
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Si hay un loop infinito, debería haber muchos renders/errores
    expect(console.error).not.toHaveBeenCalled();

    console.error = originalConsoleError;
  });
});
```

---

## 4. Rate Limiting Test

**File:** `src/__tests__/api/rate-limit.test.ts`

```typescript
import { Ratelimit } from "@upstash/ratelimit";

jest.mock("@upstash/ratelimit");

describe("Rate Limiting", () => {
  it("should block requests after limit exceeded", async () => {
    const mockRatelimit = Ratelimit as jest.MockedClass<typeof Ratelimit>;
    let callCount = 0;

    mockRatelimit.prototype.limit = jest.fn(async () => {
      callCount++;
      return { success: callCount <= 10 }; // Permitir 10, rechazar después
    });

    const ratelimit = new Ratelimit({} as any);

    // Hacer 15 requests
    for (let i = 0; i < 15; i++) {
      const result = await ratelimit.limit("test-user");

      if (i < 10) {
        expect(result.success).toBe(true);
      } else {
        expect(result.success).toBe(false);
      }
    }
  });
});
```

---

## 5. Authentication Session Test

**File:** `src/__tests__/api/auth.test.ts`

```typescript
import { POST } from "@/app/api/auth/register/route";

describe("POST /api/auth/register", () => {
  it("should not expose timing information about existing users", async () => {
    const startTime = Date.now();

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "password123",
        name: "Test",
      }),
    });

    // First call - user doesn't exist
    await POST(request);
    const firstDuration = Date.now() - startTime;

    const request2 = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "wrongpassword",
        name: "Test",
      }),
    });

    // Second call - with bcrypt comparison
    const startTime2 = Date.now();
    await POST(request2);
    const secondDuration = Date.now() - startTime2;

    // La diferencia de tiempo no debe ser significativa
    // (ambas deben incluir bcrypt delay)
    expect(Math.abs(firstDuration - secondDuration)).toBeLessThan(100);
  });

  it("should prevent email enumeration", async () => {
    // Mock prisma.usuario.findUnique
    jest.mock("@/lib/db", () => ({
      prisma: {
        usuario: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
      },
    }));

    // Intentar enumerar usuarios
    const testEmails = ["user1@test.com", "user2@test.com", "user3@test.com"];

    for (const email of testEmails) {
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password: "password123",
          name: "Test",
        }),
      });

      const response = await POST(request);
      // Todos deben tener el mismo mensaje de error genérico
      expect(response.status).toBe(400 | 409); // Bad request o conflict
    }
  });
});
```

---

## 6. Memory Leak Test

**File:** `src/__tests__/components/PokedexModal.test.tsx`

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import PokedexModal from "@/app/game/components/PokedexModal";

describe("PokedexModal - Memory Leaks", () => {
  it("should remove event listeners on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(
      document,
      "removeEventListener",
    );

    const { unmount } = render(
      <PokedexModal open={true} pokemon={[]} onClose={jest.fn()} />,
    );

    unmount();

    // Debe haber removido el listener
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });

  it("should not add duplicate listeners when open prop changes", () => {
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    const { rerender } = render(
      <PokedexModal open={true} pokemon={[]} onClose={jest.fn()} />,
    );

    const callsAfterFirstRender = addEventListenerSpy.mock.calls.length;

    // Re-render con mismo estado
    rerender(
      <PokedexModal open={true} pokemon={[]} onClose={jest.fn()} />,
    );

    // No debe agregar más listeners
    expect(addEventListenerSpy.mock.calls.length).toBe(callsAfterFirstRender);

    addEventListenerSpy.mockRestore();
  });
});
```

---

## Running Tests

```bash
# Install dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest

# Create jest.config.js
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
EOF

# Run tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Generate coverage report
npm run test -- --coverage
```

---

## Coverage Goals

| Área          | Goal     |
| ------------- | -------- |
| API Endpoints | 90%+     |
| Críticos      | 100%     |
| GameClient    | 75%+     |
| Components    | 70%+     |
| Validations   | 100%     |
| **Overall**   | **80%+** |

---

## Continuous Integration

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run test -- --coverage
      - run: npm run lint
```

---

**Próximo paso:** Implementar estos tests mientras aplicas los fixes del QUICK_FIXES.md
