import React, { useState, useEffect } from 'react';
import { Applicant, ExamSettings, Notice } from './types';
import { storage } from './services/storage';
import { Navbar, ActiveTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { RulesSection } from './components/RulesSection';
import { ApplicationWizard } from './components/ApplicationWizard';
import { StatusCheckView } from './components/StatusCheckView';
import { AdmitCardView } from './components/AdmitCardView';
import { PaymentReceiptView } from './components/PaymentReceiptView';
import { NoticeBoardView } from './components/NoticeBoardView';
import { AdmitVerificationView } from './components/AdmitVerificationView';
import { ContactView } from './components/ContactView';
import { AdminPortal } from './components/AdminPortal';
import { CommitteeView } from './components/CommitteeView';
import { CampaignsView } from './components/CampaignsView';
import { GallerySection } from './components/GallerySection';
import { MessageCircle } from 'lucide-react';
import { WebsiteEditorConfig } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [settings, setSettings] = useState<ExamSettings>(storage.getSettings());
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteEditorConfig>(() => storage.getWebsiteEditorConfig());
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<Notice | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [urlVerifyToken, setUrlVerifyToken] = useState<string>('');
  const [urlAppNo, setUrlAppNo] = useState<string>('');

  useEffect(() => {
    // Read URL search params for direct verification links (e.g., from QR code)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verifyToken');
    const appNo = params.get('appNo');
    const tab = params.get('tab') as ActiveTab;

    if (token || appNo) {
      setUrlVerifyToken(token || '');
      setUrlAppNo(appNo || '');
      setActiveTab('verify');
    } else if (tab) {
      setActiveTab(tab);
    }

    const unsub = storage.subscribe(() => {
      setSettings(storage.getSettings());
      setWebsiteConfig(storage.getWebsiteEditorConfig());
    });

    // Hydrate applicants and data from Firebase Cloud Firestore
    storage.syncWithFirebase().catch(err => {
      console.warn('Initial Firebase sync warning:', err);
    });

    return unsub;
  }, []);

  const latestNotice = storage.getNotices()[0];

  const handleApplicationSuccess = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HeroSection
            settings={settings}
            latestNotice={latestNotice}
            setActiveTab={setActiveTab}
            lang={lang}
            onSelectNotice={(notice) => {
              setSelectedNoticeModal(notice);
              setActiveTab('notices');
            }}
          />
        )}

        {activeTab === 'committee' && (
          <CommitteeView lang={lang} />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsView
            settings={settings}
            setActiveTab={setActiveTab}
            lang={lang}
          />
        )}

        {activeTab === 'gallery' && (
          <GallerySection
            isHomePageView={false}
            setActiveTab={setActiveTab}
            lang={lang}
          />
        )}

        {activeTab === 'rules' && (
          <RulesSection
            settings={settings}
            setActiveTab={setActiveTab}
            lang={lang}
          />
        )}

        {activeTab === 'apply' && (
          <ApplicationWizard
            settings={settings}
            setActiveTab={setActiveTab}
            onApplicationSuccess={handleApplicationSuccess}
            lang={lang}
          />
        )}

        {activeTab === 'status' && (
          <StatusCheckView
            settings={settings}
            setActiveTab={setActiveTab}
            onSelectApplicant={(applicant) => setSelectedApplicant(applicant)}
            lang={lang}
          />
        )}

        {activeTab === 'admit' && (
          <AdmitCardView
            selectedApplicant={selectedApplicant}
            settings={settings}
            setActiveTab={setActiveTab}
            onSelectApplicant={(applicant) => setSelectedApplicant(applicant)}
            lang={lang}
          />
        )}

        {(activeTab === 'payment' || activeTab === 'receipt') && (
          <PaymentReceiptView
            selectedApplicant={selectedApplicant}
            settings={settings}
            setActiveTab={setActiveTab}
            onSelectApplicant={(applicant) => setSelectedApplicant(applicant)}
            lang={lang}
          />
        )}

        {activeTab === 'notices' && (
          <NoticeBoardView
            selectedNoticeModal={selectedNoticeModal}
            onCloseNoticeModal={() => setSelectedNoticeModal(null)}
            lang={lang}
          />
        )}

        {activeTab === 'verify' && (
          <AdmitVerificationView
            initialToken={urlVerifyToken}
            initialAppNo={urlAppNo}
            lang={lang}
          />
        )}

        {activeTab === 'contact' && (
          <ContactView
            settings={settings}
            lang={lang}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings(newSettings)}
            setActiveTab={setActiveTab}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} lang={lang} />

      {/* Floating WhatsApp & Helpline Support Button (Website Editor Controlled) */}
      {websiteConfig.features?.showFloatingHelpline && (
        <a
          href={`https://wa.me/88${(websiteConfig.features.floatingHelplineNumber || '01750969712').replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          title={websiteConfig.features.floatingHelplineText || 'হোয়াটসঅ্যাপ হেল্পলাইন'}
          className={`fixed bottom-6 ${
            websiteConfig.features.floatingHelplinePosition === 'left' ? 'left-6' : 'right-6'
          } z-40 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group font-bangla border border-emerald-400/40`}
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="hidden sm:inline text-xs font-bold font-bangla">
            {websiteConfig.features.floatingHelplineText || 'হোয়াটসঅ্যাপ হেল্পলাইন'}
          </span>
        </a>
      )}
    </div>
  );
}
