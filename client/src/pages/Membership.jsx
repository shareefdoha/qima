import {
  ExternalLink, CheckCircle2, FileText, UserCheck, CreditCard, PartyPopper,
  GraduationCap, Users, Megaphone, BriefcaseBusiness, Mail,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, SectionHeading } from '../components/ui.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const BENEFITS = [
  { Icon: GraduationCap, title: 'Seminars & masterclasses', text: 'Priority registration and member rates on the full annual programme.' },
  { Icon: Users, title: 'Networking forums', text: 'Monthly gatherings connecting you with managers across Qatar’s industries.' },
  { Icon: BriefcaseBusiness, title: 'Career support', text: 'Mentorship circles, CV clinics and introductions during career transitions.' },
  { Icon: Megaphone, title: 'Member directory', text: 'Be listed and discoverable within the association’s professional network.' },
];

const ELIGIBILITY = [
  'A management, supervisory, professional or entrepreneurial role in Qatar.',
  'Valid Qatar ID / residence permit, or a confirmed offer of employment in Qatar.',
  'Commitment to the association’s code of professional conduct.',
  'Open to all industries, functions, seniority levels and regions of origin.',
];

const STEPS = [
  { Icon: FileText, title: 'Complete the form', text: 'Fill in the online membership application — it takes about five minutes.' },
  { Icon: UserCheck, title: 'Review', text: 'The Membership Committee reviews applications on a rolling basis.' },
  { Icon: CreditCard, title: 'Confirm membership', text: 'You receive confirmation and payment details for the annual subscription.' },
  { Icon: PartyPopper, title: 'Get involved', text: 'You’re added to the member directory and invited to the next forum.' },
];

export default function Membership() {
  const { settings } = useSettings();
  const formUrl = settings.membership_google_form_url || '';
  const formReady = Boolean(formUrl) && !formUrl.includes('REPLACE_WITH');

  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Become a member of QIMA"
        description={
          settings.membership_intro ||
          'Membership is open to management professionals of Indian origin working in Qatar, across every industry and level of seniority.'
        }
      >
        {formReady ? (
          <a href={formUrl} target="_blank" rel="noreferrer noopener" className="btn-primary">
            Open the Membership Form
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm text-navy-200">
            Applications open shortly — the form link is configured in the admin panel.
          </span>
        )}
      </PageHeader>

      {/* ---------------------------------------------------- Benefits ---- */}
      <section className="py-20 sm:py-28">
        <div className="container-qima">
          <SectionHeading
            align="center"
            eyebrow="Why join"
            title="What membership gives you"
            description="QIMA membership is a working membership — the value comes from showing up, contributing and drawing on the network."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ Icon, title, text }) => (
              <div key={title} className="card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="inline-flex rounded-xl bg-accent-50 p-3 text-accent-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-navy-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- Eligibility ---- */}
      <section className="bg-sand-100 py-20 sm:py-28">
        <div className="container-qima grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="Who can join" title="Eligibility" />
            <ul className="mt-8 space-y-4">
              {ELIGIBILITY.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
                  <span className="text-[15px] leading-relaxed text-navy-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading eyebrow="How it works" title="Four steps to membership" />
            <ol className="mt-8 space-y-5">
              {STEPS.map(({ Icon, title, text }, i) => (
                <li key={title} className="flex gap-4 rounded-xl border border-navy-100 bg-white p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
                      Step {i + 1}
                    </p>
                    <h3 className="mt-0.5 font-semibold text-navy-900">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-navy-600">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------------------------- Embedded Google Form / CTA ---- */}
      <section className="py-20 sm:py-28">
        <div className="container-qima">
          <SectionHeading
            align="center"
            eyebrow="Apply now"
            title="Membership application"
            description="The form below is hosted on Google Forms. If it doesn't load in your browser, use the button to open it in a new tab."
          />

          <div className="mx-auto mt-12 max-w-4xl">
            {formReady ? (
              <>
                <div className="overflow-hidden rounded-2xl border border-navy-200 bg-white shadow-card">
                  <iframe
                    title="QIMA Membership Application Form"
                    src={formUrl.includes('?') ? `${formUrl}&embedded=true` : `${formUrl}?embedded=true`}
                    className="h-[900px] w-full"
                    loading="lazy"
                  >
                    Loading the membership form…
                  </iframe>
                </div>
                <div className="mt-6 flex justify-center">
                  <a href={formUrl} target="_blank" rel="noreferrer noopener" className="btn-outline">
                    Open the form in a new tab
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 p-12 text-center">
                <Mail className="mx-auto h-9 w-9 text-navy-300" />
                <h3 className="mt-4 text-xl font-bold text-navy-900">The application form isn’t live yet</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-600">
                  An administrator can paste the Google Form link into{' '}
                  <span className="font-semibold">Admin Panel → Settings → membership_google_form_url</span>{' '}
                  and it will appear here immediately. In the meantime, get in touch with the Secretariat.
                </p>
                <Link to="/contact" className="btn-primary mt-7">
                  Contact the Secretariat
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
