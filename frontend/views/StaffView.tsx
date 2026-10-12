import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Language, StaffMember } from '../types';
import {
  Users,
  GraduationCap,
  Award,
  User,
  ShieldCheck,
  Search,
  Briefcase,
  BookOpen,
  Mail,
  X,
  Building2,
  CheckCircle2
} from 'lucide-react';
import {
  EducatorNameTypography,
  ScrollRevealHeading,
  TypographicBackground,
} from '../components/InteractiveTypography';

interface StaffViewProps {
  lang: Language;
  staff: StaffMember[];
}

export const StaffView: React.FC<StaffViewProps> = ({ lang, staff }) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const shouldReduceMotion = useReducedMotion();

  // Extract distinct departments and subjects
  const availableDepartments = React.useMemo(() => {
    const set = new Set<string>();
    staff.forEach(s => {
      if (s.department_en) set.add(s.department_en);
    });
    return Array.from(set).sort();
  }, [staff]);

  const availableSubjects = React.useMemo(() => {
    const set = new Set<string>();
    staff.forEach(s => {
      if (s.subject_en) set.add(s.subject_en);
    });
    return Array.from(set).sort();
  }, [staff]);

  const filteredStaff = staff
    .filter(s => roleFilter === 'all' || s.role === roleFilter)
    .filter(s => departmentFilter === 'all' || s.department_en === departmentFilter)
    .filter(s => subjectFilter === 'all' || s.subject_en === subjectFilter)
    .filter(s => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        s.name_en.toLowerCase().includes(query) ||
        s.name_np.toLowerCase().includes(query) ||
        s.designation_en.toLowerCase().includes(query) ||
        s.designation_np.toLowerCase().includes(query) ||
        (s.department_en && s.department_en.toLowerCase().includes(query)) ||
        (s.subject_en && s.subject_en.toLowerCase().includes(query))
      );
    });

  return (
    <div className="py-12 bg-white dark:bg-slate-950 min-h-[75vh]">
      {/* Interactive Staff Profile Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="relative p-6 text-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                aria-label="Close"
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Passport photo in oval container */}
              <div className="w-24 h-32 mx-auto rounded-[2rem] border-2 border-slate-300 dark:border-slate-700 overflow-hidden shadow-md bg-slate-100 dark:bg-slate-800 mb-3 flex items-center justify-center">
                {selectedStaff.image && selectedStaff.image.trim() ? (
                  <img
                    src={selectedStaff.image}
                    alt={selectedStaff.name_en}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <User className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-[10px] font-mono mt-1 uppercase">Photo</span>
                  </div>
                )}
              </div>

              <div className="space-y-1 mt-1">
                <EducatorNameTypography
                  name={t(selectedStaff.name_en, selectedStaff.name_np)}
                  role={selectedStaff.role}
                  as="h3"
                  size="xl"
                  align="center"
                  animatedEntry={true}
                />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  {t(selectedStaff.designation_en, selectedStaff.designation_np)}
                </p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                  {selectedStaff.role.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              {selectedStaff.department_en && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{t('Department', 'विभाग')}</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {t(selectedStaff.department_en, selectedStaff.department_np || selectedStaff.department_en)}
                  </span>
                </div>
              )}

              {selectedStaff.qualification_en && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Award className="w-3.5 h-3.5" />
                    <span>{t('Qualification', 'योग्यता')}</span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {t(selectedStaff.qualification_en, selectedStaff.qualification_np || selectedStaff.qualification_en)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{t('Experience', 'अनुभव')}</span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {selectedStaff.experience}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('Status', 'स्थिति')}</span>
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('Active Faculty', 'सक्रिय शिक्षक')}</span>
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                {t('Close Profile', 'बन्द गर्नुहोस्')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory Container */}
      <div className="relative overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Typographic Ambient Watermark */}
        <TypographicBackground
          text="FACULTY"
          position="top-right"
          align="right"
          opacityClass="text-slate-900/[0.02] dark:text-white/[0.015]"
        />

        <div className="relative z-10 border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <Users className="w-3.5 h-3.5 stroke-[2]" />
              <span>{t('Faculty & Administration Directory', 'शिक्षक तथा कर्मचारी विवरण')}</span>
            </div>
            <ScrollRevealHeading as="h1" className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              {t('Our Leadership & Educators', 'हाम्रा शिक्षक तथा नेतृत्व')}
            </ScrollRevealHeading>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {t(
                'Meet our certified instructors, department heads, and academic leaders dedicated to excellence in education.',
                'दक्ष, अनुभवी र समर्पित शिक्षक तथा प्रशासनिक कर्मचारीहरूको नेतृत्वमा अनुशासित शैक्षिक यात्रा।'
              )}
            </p>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search educator...', 'शिक्षक खोज्नुहोस्...')}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', en: 'All Members', np: 'सबै' },
                { id: 'principal', en: 'Principal', np: 'प्रधानाध्यापक' },
                { id: 'teacher', en: 'Faculty', np: 'शिक्षक' },
                { id: 'admin', en: 'Administration', np: 'प्रशासन' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
                    roleFilter === tab.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t(tab.en, tab.np)}
                </button>
              ))}

              {availableDepartments.length > 0 && (
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <option value="all">{t('All Departments', 'सबै विभाग')}</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              )}

              {availableSubjects.length > 0 && (
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <option value="all">{t('All Subjects', 'सबै विषय')}</option>
                  {availableSubjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Staff Grid with Oval-Shaped Passport Photos */}
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            {t('No staff members found matching your search.', 'कुनै शिक्षक वा कर्मचारी विवरण भेटिएन।')}
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStaff.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: shouldReduceMotion ? 0 : Math.min(idx * 0.035, 0.28),
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => setSelectedStaff(member)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSelectedStaff(member);
                }}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4 shadow-2xs hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer group focus:outline-hidden focus:ring-2 focus:ring-slate-400"
              >
                {/* Oval-Shaped Passport Profile Container (3:4 aspect ratio) */}
                <div className="w-24 h-32 mx-auto rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 group-hover:border-amber-400 dark:group-hover:border-amber-400 overflow-hidden bg-slate-100 dark:bg-slate-800/80 shadow-xs flex items-center justify-center transition-all duration-200 relative">
                  {member.image && member.image.trim() ? (
                    <img
                      src={member.image}
                      alt={member.name_en}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      {member.role === 'principal' ? (
                        <GraduationCap className="w-9 h-9 stroke-[1.5]" />
                      ) : member.role === 'admin' ? (
                        <ShieldCheck className="w-9 h-9 stroke-[1.5]" />
                      ) : (
                        <User className="w-9 h-9 stroke-[1.5]" />
                      )}
                      <span className="text-[9px] font-mono uppercase mt-1 tracking-wider opacity-60">
                        Passport
                      </span>
                    </div>
                  )}

                  {/* Subtle hover overlay badge */}
                  <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium backdrop-blur-[1px]">
                    {t('View Profile', 'विवरण हेर्नुहोस्')}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    <EducatorNameTypography
                      name={t(member.name_en, member.name_np)}
                      role={member.role}
                      as="h2"
                      size="md"
                      align="center"
                      delay={shouldReduceMotion ? 0 : Math.min(idx * 0.035, 0.28)}
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    {t(member.designation_en, member.designation_np)}
                  </p>
                  {member.department_en && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {t(member.department_en, member.department_np || member.department_en)}
                    </p>
                  )}
                  {/* Small CMS information layer on hover */}
                  {member.qualification_en && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium tracking-wide truncate max-w-full opacity-90 transition-opacity">
                      {t(member.qualification_en, member.qualification_np || member.qualification_en)}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.experience}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffView;
