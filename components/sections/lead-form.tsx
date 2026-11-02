import { buildLeadFormUrl, type LeadContext } from "@/lib/leads";
import { site } from "@/config/site";

export function LeadForm({
  context = {},
  title = "Send your request",
}: {
  context?: LeadContext;
  title?: string;
}) {
  const url = buildLeadFormUrl(context);
  return (
    <section className="panel lead-form" aria-label={title}>
      <h2>{title}</h2>
      {url ? (
        <>
          <p className="my-4">
            Share your details below and our team will be in touch.
          </p>
          <iframe
            key={url}
            src={url}
            title={title}
            className="w-full border-0 min-h-[760px]"
            loading="lazy"
            allow="fullscreen"
          />
          <p className="note">
            Having trouble viewing the form?{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Open the request form in a new tab
            </a>
            .
          </p>
        </>
      ) : (
        <div className="my-5" role="status">
          <p>
            Our online request form is coming soon. Please contact our team
            directly.
          </p>
          <div className="flex flex-wrap gap-4 mt-5">
            <a className="btn btn-dark" href={`tel:${site.phone}`}>
              Call the salon
            </a>
            <a className="btn btn-outline" href={`mailto:${site.email}`}>
              Email our team
            </a>
          </div>
        </div>
      )}
      <p className="note">
        Requests are subject to availability and confirmation by our team.
      </p>
    </section>
  );
}
