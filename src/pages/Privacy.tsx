import { useEffect } from "react";

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy - Accountant AI";
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Your privacy matters to us</p>
        </div>
      </header>

      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6 text-muted-foreground">
          <p>
            We collect only the data necessary to provide our services, including account details and usage
            information. Documents you upload are processed securely. You can request deletion at any time.
          </p>
          <p>
            We do not sell your personal information. Third‑party processors (e.g., payments, bank connectivity)
            are vetted for compliance and security.
          </p>
          <p>
            For questions, contact support via the Help center in your account.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Privacy;
