import { useEffect } from "react";

const Cookies = () => {
  useEffect(() => {
    document.title = "Cookie Policy - Accountant AI";
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold">Cookie Policy</h1>
          <p className="text-muted-foreground mt-2">How we use cookies</p>
        </div>
      </header>

      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6 text-muted-foreground">
          <p>
            We use essential cookies for authentication and security, and optional cookies to improve performance
            and personalize your experience. You can manage preferences in your browser settings.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Cookies;
