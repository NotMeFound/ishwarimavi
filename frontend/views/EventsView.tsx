import React from 'react';
import { Language, SchoolEvent } from '../types';
import { Calendar, Clock, MapPin, CalendarDays } from 'lucide-react';

interface EventsViewProps {
  lang: Language;
  events: SchoolEvent[];
}

export const EventsView: React.FC<EventsViewProps> = ({ lang, events }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{t('Academic Calendar & Schedule', 'वार्षिक शैक्षिक क्यालेन्डर')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('Institutional Events & Routines', 'कार्यक्रम तथा अतिरिक्त क्रियाकलाप')}
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
            {t(
              'Key dates for examinations, cultural assemblies, athletics championships, and community exhibitions.',
              'परीक्षा, सांस्कृतिक कार्यक्रम, खेलकुद सप्ताह र अभिभावक भेलाहरूको कार्यतालिका।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3.5 shadow-2xs hover:border-[#1E40AF]/40 transition"
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#1E40AF] font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t(event.date_en, event.date_np)}</span>
                </span>
                <span className="font-mono text-slate-500 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{event.time}</span>
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t(event.title_en, event.title_np)}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t(event.desc_en, event.desc_np)}
              </p>
              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1E40AF]" />
                <span>{t(event.venue_en, event.venue_np)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsView;
