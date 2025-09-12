import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BusinessExportRequest {
  email: string;
  data: any;
  format: 'pdf' | 'csv';
  exportOptions: {
    taxCalculations: boolean;
    aiVerdicts: boolean;
    businessAnalysis: boolean;
    transactions: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, data, format, exportOptions }: BusinessExportRequest = await req.json();

    // Generate email content based on format and data
    let attachmentContent = '';
    let attachmentFilename = '';
    let attachmentType = '';

    if (format === 'csv') {
      attachmentContent = generateCSVContent(data);
      attachmentFilename = `business-export-${new Date().toISOString().split('T')[0]}.csv`;
      attachmentType = 'text/csv';
    } else {
      attachmentContent = JSON.stringify(data, null, 2);
      attachmentFilename = `business-export-${new Date().toISOString().split('T')[0]}.json`;
      attachmentType = 'application/json';
    }

    const htmlContent = generateEmailHTML(data, exportOptions);

    const emailResponse = await resend.emails.send({
      from: "Accountant AI <exports@resend.dev>",
      to: [email],
      subject: `Your Business Data Export - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
      attachments: [
        {
          filename: attachmentFilename,
          content: Buffer.from(attachmentContent).toString('base64'),
          type: attachmentType,
        }
      ],
    });

    console.log("Business export email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-business-export function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateCSVContent(data: any): string {
  let csvContent = '';

  if (data.taxCalculations) {
    csvContent += 'TAX CALCULATIONS\n';
    csvContent += 'ID,Type,Gross Income,Total Deductions,Taxable Income,Tax Liability,Amount Owed,Calculated At\n';
    data.taxCalculations.forEach((calc: any) => {
      csvContent += `${calc.id},${calc.calculationType},${calc.grossIncome},${calc.totalDeductions},${calc.taxableIncome},${calc.taxLiability},${calc.amountOwed},${calc.calculatedAt}\n`;
    });
    csvContent += '\n';
  }

  if (data.aiInteractions) {
    csvContent += 'AI INTERACTIONS\n';
    csvContent += 'Session ID,Title,Created At,Role,Message,Timestamp\n';
    data.aiInteractions.forEach((session: any) => {
      session.messages.forEach((msg: any) => {
        const cleanContent = msg.content.replace(/"/g, '""').replace(/\n/g, ' ');
        csvContent += `${session.id},"${session.title}",${session.createdAt},${msg.role},"${cleanContent}",${msg.timestamp}\n`;
      });
    });
    csvContent += '\n';
  }

  if (data.transactions) {
    csvContent += 'TRANSACTIONS\n';
    csvContent += 'ID,Description,Amount,Type,Category,Date,Created At\n';
    data.transactions.forEach((transaction: any) => {
      csvContent += `${transaction.id},"${transaction.description}",${transaction.amount},${transaction.type},"${transaction.category}",${transaction.date},${transaction.createdAt}\n`;
    });
  }

  return csvContent;
}

function generateEmailHTML(data: any, exportOptions: any): string {
  const exportDate = new Date(data.exportDate).toLocaleDateString();
  
  let summarySection = '';
  let sectionsCount = 0;
  
  if (exportOptions.taxCalculations && data.taxCalculations) {
    sectionsCount++;
    summarySection += `<li><strong>Tax Calculations:</strong> ${data.taxCalculations.length} records</li>`;
  }
  
  if (exportOptions.aiVerdicts && data.aiInteractions) {
    sectionsCount++;
    const totalMessages = data.aiInteractions.reduce((total: number, session: any) => total + session.messages.length, 0);
    summarySection += `<li><strong>AI Interactions:</strong> ${data.aiInteractions.length} sessions, ${totalMessages} messages</li>`;
  }
  
  if (exportOptions.transactions && data.transactions) {
    sectionsCount++;
    summarySection += `<li><strong>Transactions:</strong> ${data.transactions.length} records</li>`;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Accountant AI - Business Data Export</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 2.2em;
            font-weight: 300;
          }
          .summary {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
          }
          .summary h2 {
            color: #007bff;
            margin-top: 0;
          }
          .summary ul {
            margin: 15px 0;
            padding-left: 20px;
          }
          .summary li {
            margin: 8px 0;
          }
          .section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
          }
          .section-title {
            color: #007bff;
            font-size: 1.4em;
            font-weight: 600;
            margin-bottom: 15px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
          }
          .tax-item, .ai-session {
            background: #ffffff;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border: 1px solid #dee2e6;
          }
          .amount {
            font-weight: bold;
            color: #28a745;
          }
          .negative {
            color: #dc3545;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 0.9em;
            color: #6c757d;
          }
          .attachment-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
          .attachment-note strong {
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🤖 Accountant AI</h1>
          <p style="margin: 0; font-size: 1.1em; opacity: 0.9;">Business Data Export</p>
        </div>

        <div class="summary">
          <h2>📊 Export Summary</h2>
          <p><strong>Export Date:</strong> ${exportDate}</p>
          <p><strong>User Email:</strong> ${data.userEmail}</p>
          <p><strong>Sections Included:</strong></p>
          <ul>
            ${summarySection}
          </ul>
        </div>

        <div class="attachment-note">
          <strong>📎 Attachment Included:</strong> Your complete business data is attached to this email in the format you selected. 
          You can import this data into Excel, Google Sheets, or other business applications.
        </div>

        ${data.taxCalculations ? `
        <div class="section">
          <div class="section-title">🧮 Tax Calculations</div>
          ${data.taxCalculations.slice(0, 5).map((calc: any) => `
            <div class="tax-item">
              <div style="display: flex; justify-content: between; align-items: center;">
                <div>
                  <strong>Type:</strong> ${calc.calculationType.charAt(0).toUpperCase() + calc.calculationType.slice(1)}<br>
                  <strong>Gross Income:</strong> <span class="amount">$${calc.grossIncome.toLocaleString()}</span><br>
                  <strong>Tax Liability:</strong> <span class="amount ${calc.taxLiability < 0 ? 'negative' : ''}">$${calc.taxLiability.toLocaleString()}</span>
                </div>
                <div style="text-align: right; font-size: 0.9em; color: #6c757d;">
                  ${new Date(calc.calculatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          `).join('')}
          ${data.taxCalculations.length > 5 ? `<p style="text-align: center; color: #6c757d; font-style: italic;">... and ${data.taxCalculations.length - 5} more calculations in the attachment</p>` : ''}
        </div>
        ` : ''}

        ${data.aiInteractions ? `
        <div class="section">
          <div class="section-title">🤖 AI Interactions Preview</div>
          ${data.aiInteractions.slice(0, 3).map((session: any) => `
            <div class="ai-session">
              <h4 style="margin: 0 0 10px 0; color: #007bff;">${session.title}</h4>
              <p style="margin: 0; font-size: 0.9em; color: #6c757d;">
                ${session.messages.length} messages • ${new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
          `).join('')}
          ${data.aiInteractions.length > 3 ? `<p style="text-align: center; color: #6c757d; font-style: italic;">... and ${data.aiInteractions.length - 3} more sessions in the attachment</p>` : ''}
        </div>
        ` : ''}

        <div class="footer">
          <p><strong>Accountant AI</strong> - Your AI-Powered Accounting Platform</p>
          <p style="margin: 5px 0 0 0;">This export was generated automatically. Please keep this data secure and confidential.</p>
        </div>
      </body>
    </html>
  `;
}

serve(handler);