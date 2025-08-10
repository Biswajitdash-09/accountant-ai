import { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    document.title = "Terms of Service - Accountant AI";
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Please read carefully</p>
        </div>
      </header>

      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6 text-muted-foreground">
          <p>
            By using Accountant AI, you agree to our acceptable use policies and acknowledge that outputs are for
            informational purposes and should be reviewed by a qualified professional when required.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account. Service availability may vary,
            and we reserve the right to update features and policies.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Terms;
