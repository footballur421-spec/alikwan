import React, { useState } from 'react';
import { INSTITUTION, ExamSettings, OFFICIAL_CONTACTS } from '../types';
import { MapPin, Phone, Mail, HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { convertToBengaliNumber } from '../utils/validation';
import { SupportedLang, toLangNumber } from '../utils/i18n';

interface ContactViewProps {
  settings: ExamSettings;
  lang?: SupportedLang;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings, lang = 'bn' }) => {
  const isEnglish = lang === 'en';
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const faqs = [
    {
      q: 'কোন শ্রেণির শিক্ষার্থীরা এই বৃত্তি পরীক্ষায় অংশ নিতে পারবে?',
      a: 'নীতিমালা অনুযায়ী শুধুমাত্র পঞ্চম শ্রেণির (সাধারণ প্রাথমিক ও ইবতেদায়ী) নিয়মিত শিক্ষার্থীরা এই পরীক্ষায় অংশগ্রহণ করতে পারবে।'
    },
    {
      q: 'কোন কোন এলাকার শিক্ষাপ্রতিষ্ঠান এই পরীক্ষার জন্য যোগ্য?',
      a: 'মৌলভীবাজার জেলার বড়লেখা উপজেলার আওতাধীন সকল প্রাথমিক ও ইবতেদায়ী প্রতিষ্ঠান এবং সিলেট জেলার বিয়ানীবাজার উপজেলার লাউতা ইউনিয়ন পরিষদের আওতাধীন শিক্ষাপ্রতিষ্ঠানসমূহ।'
    },
    {
      q: 'একটি শিক্ষাপ্রতিষ্ঠান থেকে সর্বোচ্চ কতজন শিক্ষার্থী অংশ নিতে পারবে?',
      a: 'প্রতিষ্ঠানপ্রধান বা প্রধান শিক্ষকের অনুমতিক্রমে একটি শিক্ষাপ্রতিষ্ঠান থেকে সর্বোচ্চ ৭ (সাত) জন শিক্ষার্থী অংশগ্রহণ করতে পারবে। ৭ জনের অধিক আবেদন গ্রহণযোগ্য নয়।'
    },
    {
      q: 'অনলাইনে আবেদন করার শেষ সময় ও পরীক্ষার তারিখ কবে?',
      a: `আবেদন জমা দেওয়ার শেষ তারিখ ২৫ অক্টোবর ২০২৫ইং। পরীক্ষা অনুষ্ঠিত হবে ১৪ নভেম্বর ২০২৬ইং, রোজ শনিবার সকাল ১০:০০ ঘটিকা হতে।`
    },
    {
      q: 'বৃত্তি পরীক্ষার আবেদন ফি কত এবং কীভাবে পরিশোধ করতে হবে?',
      a: `আবেদন ফি জনপ্রতি ১০০/- (একশত) টাকা। আবেদনপত্র পূরণের পূর্বে বিকাশ এজেন্ট নম্বর ০১৭৯৭-২৬৭৯২৪-এ ক্যাশ আউট করে যে নম্বর থেকে ক্যাশ আউট করা হয়েছে তা আবেদন ফরমে উল্লেখ করতে হবে।`
    },
    {
      q: 'প্রবেশপত্র কীভাবে পাব এবং পরীক্ষার দিন করণীয় কী?',
      a: 'নির্ধারিত তারিখে প্রবেশপত্র উন্মুক্ত হওয়ার পর ওয়েবসাইট থেকেই প্রবেশপত্র ডাউনলোড ও প্রিন্ট করা যাবে। পরীক্ষার দিন মূল প্রবেশপত্র সঙ্গে রাখা বাধ্যতামূলক।'
    }
  ];

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim() || !inquiryMessage.trim()) return;
    setInquirySent(true);
    setTimeout(() => {
      setInquiryName('');
      setInquiryPhone('');
      setInquiryMessage('');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Masthead */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 space-y-3">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-[11px] font-bold text-[#0272A6] uppercase tracking-wider block">
            {isEnglish ? 'Institutional Helpdesk & Secretarial Contacts' : 'দাপ্তরিক যোগাযোগ ও সাধারণ জিজ্ঞাসা'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-bn text-[#07243B] mt-1">
            {isEnglish ? 'Contact & Official Helpdesk' : 'কার্যালয়, যোগাযোগ ও প্রশ্নোত্তর (FAQ)'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {INSTITUTION.name} (রেজিস্ট্রেশন নং ২৯৯) — বড়লেখা, মৌলভীবাজার
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Column */}
        <div className="md:col-span-1 space-y-4">
          {/* Office Address */}
          <div className="bg-white border border-slate-200 p-5 space-y-2">
            <span className="text-[10px] font-bold text-[#0272A6] uppercase tracking-wider block">
              স্থায়ী কার্যালয়
            </span>
            <h3 className="text-sm font-bold text-[#07243B]">কেন্দ্রীয় কার্যালয়</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              গ্রাম: গল্লাসাঙ্গন, ডাকঘর: গল্লাসাঙ্গন, উপজেলা: বড়লেখা, জেলা: মৌলভীবাজার, সিলেট বিভাগ।
            </p>
            <span className="text-[11px] font-mono text-slate-500 block pt-1 border-t border-slate-100">
              রেজিস্ট্রেশন নং: ২৯৯ · স্থাপিত: ২০০০ইং
            </span>
          </div>

          {/* Official Emergency Contact Persons */}
          <div className="bg-white border border-slate-200 p-5 space-y-3">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              দায়িত্বশীল কর্মকর্তা ও হেল্পলাইন
            </span>

            <div className="space-y-3">
              {OFFICIAL_CONTACTS.map((person, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0 space-y-0.5">
                  <div className="text-xs font-bold text-[#07243B]">{person.name}</div>
                  <div className="text-[11px] text-slate-500">{person.designation}</div>
                  <a
                    href={`tel:${person.rawPhone}`}
                    className="text-xs font-mono font-bold text-[#0272A6] hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{person.phone}</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 text-xs">
              <a
                href="https://web.facebook.com/profile.php?id=100015332053937"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#0272A6] hover:underline font-semibold flex items-center gap-1.5"
              >
                <span>ফেইসবুক প্রোফাইল দেখুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Inquiry Box */}
          <div className="bg-white border border-slate-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#07243B] border-b border-slate-200 pb-2">
              লিখিত বার্তা পাঠান
            </h3>

            {inquirySent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800">বার্তাটি গৃহীত হয়েছে</p>
                <p className="text-[11px] text-emerald-700">শীঘ্রই আপনার নম্বরে যোগাযোগ করা হবে।</p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="আপনার নাম"
                  value={inquiryName}
                  onChange={e => setInquiryName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 bg-white focus:border-[#0272A6] outline-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="মোবাইল নম্বর"
                  value={inquiryPhone}
                  onChange={e => setInquiryPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 bg-white focus:border-[#0272A6] outline-none"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="বার্তা বা প্রশ্ন..."
                  value={inquiryMessage}
                  onChange={e => setInquiryMessage(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 bg-white focus:border-[#0272A6] outline-none resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#0272A6] hover:bg-[#065A82] text-white text-xs font-bold transition cursor-pointer"
                >
                  বার্তা পাঠান
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQs Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold text-[#07243B] font-serif-bn">
                সাধারণ প্রশ্নোত্তর (FAQ)
              </h2>
            </div>

            <div className="border border-slate-200 divide-y divide-slate-200">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 text-left flex justify-between items-center gap-3 cursor-pointer hover:bg-slate-50 transition"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#07243B]">
                      {idx + 1}. {faq.q}
                    </span>
                    <span className="text-slate-400 shrink-0">
                      {openFaq === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {openFaq === idx && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
