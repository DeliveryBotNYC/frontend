// termsContent.js
export const termsContent = {
  title: "INDEPENDENT CONTRACTOR AGREEMENT",
  lastUpdated: new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  sections: [
    {
      title: "Purpose of the Agreement",
      number: "1",
      content: [
        {
          subsection: "1.1",
          text: "DBX Delivery provides access to delivery opportunities through a platform available at www.dbx.delivery and the DBX Driver App, allowing Contractors to complete multi-stop delivery routes for third-party businesses and consumers.",
        },
        {
          subsection: "1.2",
          text: "You understand and agree that you are an independent contractor and not an employee, agent, franchisee, or legal representative of DBX Delivery for any purpose.",
        },
        {
          subsection: "1.3",
          text: "Nothing in this Agreement guarantees a specific volume of delivery work. You may accept, decline, or ignore delivery opportunities at your discretion.",
        },
      ],
    },
    {
      title: "Contracted Services",
      number: "2",
      content: [
        {
          subsection: "2.1",
          text: "You may accept:",
          list: [
            "Instant Routes: Delivery routes available for immediate acceptance and start.",
            "Advanced Routes: Future-scheduled delivery routes which you may reserve in advance.",
          ],
        },
        {
          subsection: "2.2",
          text: "Once accepted, you are contractually bound to complete the route as assigned, including:",
          list: [
            "Picking up all assigned orders from the listed merchant locations;",
            "Delivering to all destinations within the specified timeframe;",
            'Capturing accurate Proof of Delivery ("POD") through the DBX Driver App (e.g., photos, signatures, geotags).',
          ],
        },
        {
          subsection: "2.3",
          text: "Failure to complete services properly may result in payment forfeiture and/or account deactivation.",
        },
        {
          subsection: "2.4",
          text: "You are solely responsible for your method of completing the route, including route selection, navigation, and compliance with local laws.",
        },
      ],
    },
    {
      title: "Driver Requirements & Conduct",
      number: "3",
      content: [
        {
          text: "You agree to:",
          list: [
            "Maintain a valid driver's license and necessary auto insurance.",
            "Provide your own smartphone, vehicle, and fuel.",
            "Act professionally and courteously toward customers and merchants.",
            "Not engage in any fraudulent or deceptive behavior.",
          ],
        },
        {
          text: "You may be deactivated for:",
          list: [
            "Falsified or missing PODs",
            "Repeated route lateness or no-shows",
            "Unauthorized contact with customers",
            "Fraud, theft, or tampering",
            "Low customer ratings or repeated complaints",
            "Use of another person's account or credentials",
          ],
        },
      ],
    },
    {
      title: "Platform Tools & Third-Party Integration",
      number: "4",
      content: [
        {
          subsection: "4.1",
          text: "DBX Delivery uses third-party tools including but not limited to:",
          list: [
            "Stripe (for payments)",
            "Twilio (SMS, masked calling)",
            "SendGrid (transactional emails)",
            "Google Analytics (site/app behavior)",
            "HubSpot (driver and customer CRM)",
          ],
        },
        {
          subsection: "4.2",
          text: "These services may collect, process, or store:",
          list: [
            "IP address",
            "Real-time location data",
            "Device/browser metadata",
            "Message content (e.g., SMS delivery confirmations)",
          ],
        },
        {
          subsection: "4.3",
          text: "You acknowledge and agree that:",
          list: [
            "Customers may receive your first name, phone number (via masked call), real-time GPS tracking, and estimated arrival during delivery.",
            "Your location will be tracked by DBX's systems during route execution to ensure route quality and provide support if needed.",
          ],
        },
      ],
    },
    {
      title: "Payment Terms",
      number: "5",
      content: [
        {
          subsection: "5.1",
          text: "You will be paid weekly, each Wednesday, for all completed and verified deliveries from the prior Monday–Sunday cycle.",
        },
        {
          subsection: "5.2",
          text: "Payments are processed via Stripe, and you must provide valid bank account or debit card details via the DBX platform.",
        },
        {
          subsection: "5.3",
          text: "You are solely responsible for all taxes arising from payments made under this Agreement, including income tax, self-employment tax, and insurance contributions.",
        },
      ],
    },
    {
      title: "Confidentiality & Data Use",
      number: "6",
      content: [
        {
          subsection: "6.1",
          text: "You agree not to retain, share, or misuse any customer information (e.g., names, addresses, photos, phone numbers) for any purpose beyond route completion.",
        },
        {
          subsection: "6.2",
          text: "You must not take screenshots or recordings of internal company software, customer data, route structures, or app content unless explicitly authorized.",
        },
        {
          subsection: "6.3",
          text: "Upon account deactivation or contract termination, you must delete all delivery-related materials from your device(s).",
        },
      ],
    },
    {
      title: "Non-Employment Relationship",
      number: "7",
      content: [
        {
          subsection: "7.1",
          text: "This Agreement does not constitute employment, and DBX Delivery will not provide:",
          list: [
            "Health insurance",
            "Paid time off",
            "Workers' compensation",
            "Unemployment insurance",
          ],
        },
        {
          subsection: "7.2",
          text: "You are free to perform services for other companies, including direct competitors, at any time, including while registered on the DBX platform.",
        },
      ],
    },
    {
      title: "Termination",
      number: "8",
      content: [
        {
          subsection: "8.1",
          text: "Either party may terminate this Agreement at any time, with or without cause, upon written notice.",
        },
        {
          subsection: "8.2",
          text: "DBX Delivery reserves the right to deactivate your account immediately in cases of:",
          list: [
            "Customer safety concerns",
            "Gross misconduct",
            "Violation of this Agreement",
            "Regulatory compliance issues",
          ],
        },
      ],
    },
    {
      title: "Arbitration & Dispute Resolution",
      number: "9",
      content: [
        {
          subsection: "9.1",
          text: "You and DBX Delivery agree to resolve disputes arising from this Agreement by final and binding arbitration, except as prohibited by law.",
        },
        {
          subsection: "9.2",
          text: 'You may opt out of this arbitration clause within 30 days of accepting this Agreement by emailing legal@dbx.delivery with the subject line "Arbitration Opt-Out".',
        },
      ],
    },
    {
      title: "General Terms",
      number: "10",
      content: [
        {
          subsection: "10.1",
          text: "This Agreement is the entire understanding between you and DBX Delivery (also known as Delivery Bot LLC).",
        },
        {
          subsection: "10.2",
          text: "You may not assign this Agreement to another party. DBX Delivery (also known as Delivery Bot LLC) may assign this Agreement at its discretion.",
        },
        {
          subsection: "10.3",
          text: "This Agreement is governed by the laws of the State of New York, unless otherwise required by your jurisdiction.",
        },
      ],
    },
  ],
};
