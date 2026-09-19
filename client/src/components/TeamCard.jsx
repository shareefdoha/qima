import { Linkedin, Mail, User } from 'lucide-react';

export default function TeamCard({ member }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-4/5 overflow-hidden bg-navy-100">
        {member.image_url ? (
          <img
            src={member.image_url}
            alt={member.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-700 to-navy-950">
            <User className="h-16 w-16 text-white/30" />
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-navy-700 backdrop-blur">
          {member.role_category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-bold leading-tight text-navy-900">{member.name}</h3>
        <p className="mt-1 text-sm font-semibold text-accent-600">{member.designation}</p>

        {member.bio && (
          <p className="mt-4 flex-1 text-sm leading-relaxed text-navy-600">{member.bio}</p>
        )}

        {(member.email || member.linkedin_url) && (
          <div className="mt-6 flex items-center gap-2 border-t border-navy-100 pt-5">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                aria-label={`Email ${member.name}`}
                title={member.email}
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-3.5 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-accent-600 hover:bg-accent-600 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
            )}
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`${member.name} on LinkedIn`}
                className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-3.5 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-white"
              >
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
