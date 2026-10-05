import React, { useState, useEffect } from 'react';
import {
  User,
  Patient,
  ClinicalEvent,
  Prescription,
  Investigation,
  SpecialistReferral,
  ClinicalCommunication,
  SeniorApproach
} from './types';
import { api, getStoredToken, setStoredToken } from './api';
import { Header } from './components/Header';
import { PatientSidebar } from './components/PatientSidebar';
import { JuniorDashboard } from './components/JuniorDashboard';
import { SeniorDashboard } from './components/SeniorDashboard';
import { SpecialistDashboard } from './components/SpecialistDashboard';
import { SharedPatientPage } from './components/SharedPatientPage';
import { SeniorApproachSection } from './components/SeniorApproachSection';
import { LandingPage } from './components/LandingPage';
import {
  AddEventModal,
  NewPrescriptionModal,
  ChangePrescriptionModal,
  AdministerModal,
  OrderInvestigationModal,
  RecordResultModal,
  CreateReferralModal,
  RespondReferralModal,
  CreateCommunicationModal,
  ShareSeniorApproachModal
} from './components/Modals';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [approaches, setApproaches] = useState<SeniorApproach[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null);
  const [selectedApproachId, setSelectedApproachId] = useState<string | null>(null);

  // View state: 'dashboard' | 'patient' | 'approach'
  const [currentView, setCurrentView] = useState<'dashboard' | 'patient' | 'approach'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal visibility states
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isNewRxOpen, setIsNewRxOpen] = useState(false);
  const [changeRxTarget, setChangeRxTarget] = useState<Prescription | null>(null);
  const [administerTarget, setAdministerTarget] = useState<Prescription | null>(null);
  const [isOrderInvOpen, setIsOrderInvOpen] = useState(false);
  const [recordResultTarget, setRecordResultTarget] = useState<Investigation | null>(null);
  const [isCreateReferralOpen, setIsCreateReferralOpen] = useState(false);
  const [respondReferralTarget, setRespondReferralTarget] = useState<SpecialistReferral | null>(null);
  const [isCreateCommOpen, setIsCreateCommOpen] = useState(false);
  const [isShareApproachOpen, setIsShareApproachOpen] = useState(false);

  // 0. Landing Page / Demo Routing State
  const [inDemo, setInDemo] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isDemoPath = window.location.pathname.startsWith('/demo') ||
                         window.location.hash === '#demo' ||
                         window.location.search.includes('demo=true');
      const wasInDemo = sessionStorage.getItem('healthagram_in_demo') === 'true';
      if (isDemoPath) return true;
      if (wasInDemo && window.location.pathname === '/demo') return true;
    }
    return false;
  });

  useEffect(() => {
    const handlePopState = () => {
      const isDemo = window.location.pathname.startsWith('/demo') ||
                     window.location.hash === '#demo' ||
                     window.location.search.includes('demo=true');
      setInDemo(isDemo);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleEnterDemo = () => {
    sessionStorage.setItem('healthagram_in_demo', 'true');
    window.history.pushState(null, '', '/demo');
    setInDemo(true);
  };

  // 1. Initial Authentication Boot (Default: Dr. Suresh - Senior Doctor)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getStoredToken();
        if (token) {
          const user = await api.getMe();
          setCurrentUser(user);
        } else {
          // Default login as Senior Doctor Dr. Suresh
          const res = await api.login('suresh@healthagram.clinic', 'Password123!');
          setStoredToken(res.token);
          setCurrentUser(res.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        try {
          const res = await api.login('suresh@healthagram.clinic', 'Password123!');
          setStoredToken(res.token);
          setCurrentUser(res.user);
        } catch {}
      }
    };
    initAuth();
  }, []);

  // 2. Fetch doctors, patients, and senior approaches
  const loadClinicalData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setErrorMessage(null);
      const [allDocs, allPatients, allApproaches] = await Promise.all([
        api.getDoctors(),
        api.getPatients(),
        api.listSeniorApproaches()
      ]);
      setDoctors(allDocs);
      setPatients(allPatients);
      const uniqueApproaches = Array.from(
        new Map(allApproaches.map((a) => [`${a.patientId}-${a.title}`, a])).values()
      );
      setApproaches(uniqueApproaches);

      // Select first patient by default if none selected or if previous selected is not in accessible list
      if (allPatients.length > 0) {
        if (!selectedPatientId || !allPatients.some((p) => p.id === selectedPatientId)) {
          setSelectedPatientId(allPatients[0].id);
        }
      } else {
        setSelectedPatientId(null);
        setPatientDetails(null);
      }
    } catch (err: any) {
      console.error('Failed to load clinical data:', err);
      setErrorMessage(err.message || 'Failed to load clinical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinicalData();
  }, [currentUser]);

  // 3. Load Selected Patient Details
  const loadPatientWorkspace = async (patientId: string) => {
    try {
      setErrorMessage(null);
      const details = await api.getPatient(patientId);
      setPatientDetails(details);
    } catch (err: any) {
      console.error('Failed to load patient workspace:', err);
      setPatientDetails(null);
      setErrorMessage(err.message || 'Access restricted to this patient record.');
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientWorkspace(selectedPatientId);
    }
  }, [selectedPatientId]);

  const refreshCurrentPatient = async () => {
    if (selectedPatientId) {
      await loadPatientWorkspace(selectedPatientId);
    }
    try {
      const [allPatients, allApproaches] = await Promise.all([
        api.getPatients(),
        api.listSeniorApproaches()
      ]);
      setPatients(allPatients);
      const uniqueApproaches = Array.from(
        new Map(allApproaches.map((a) => [`${a.patientId}-${a.title}`, a])).values()
      );
      setApproaches(uniqueApproaches);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Navigation handlers
  const handleOpenPatientRecord = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentView('patient');
  };

  const handleNavigateToApproach = (approachId?: string) => {
    if (approachId) setSelectedApproachId(approachId);
    setCurrentView('approach');
  };

  // Clinical Action Handlers with explicit permission error handling
  const handleAddEvent = async (data: any) => {
    if (!selectedPatientId) return;
    try {
      await api.addClinicalEvent(selectedPatientId, data);
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleCreatePrescription = async (data: any) => {
    if (!selectedPatientId) return;
    try {
      await api.createPrescription({ ...data, patientId: selectedPatientId });
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleChangePrescription = async (id: string, data: any) => {
    try {
      await api.changePrescription(id, data);
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleStopPrescription = async (rx: Prescription) => {
    const reason = prompt(`Enter reason to discontinue ${rx.medication}:`);
    if (!reason) return;
    try {
      await api.stopPrescription(rx.id, reason);
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleAdministerMedication = async (id: string, data: any) => {
    try {
      await api.administerMedication(id, data);
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleOrderInvestigation = async (data: any) => {
    if (!selectedPatientId) return;
    try {
      await api.orderInvestigation({ ...data, patientId: selectedPatientId });
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleRecordResult = async (id: string, data: any) => {
    try {
      await api.recordResult(id, data);
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleCreateReferral = async (data: any) => {
    if (!selectedPatientId) return;
    try {
      await api.createReferral({ ...data, patientId: selectedPatientId });
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleRespondReferral = async (id: string, recommendation: string) => {
    try {
      await api.respondReferral(id, { recommendation, status: 'COMPLETED' });
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleCreateCommunication = async (data: any) => {
    if (!selectedPatientId) return;
    try {
      await api.createCommunication({ ...data, patientId: selectedPatientId });
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleShareSeniorApproach = async (data: any) => {
    try {
      await api.createSeniorApproach(data);
      await refreshCurrentPatient();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  if (!inDemo) {
    return <LandingPage onEnterDemo={handleEnterDemo} />;
  }

  return (
    <div className="app-container">
      {/* Header with Doctor quick-switcher & View Mode navigation */}
      <Header
        currentUser={currentUser}
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        onUserChanged={(u) => {
          setCurrentUser(u);
          if (u?.role !== 'JUNIOR_DOCTOR' && currentView === 'approach') {
            setCurrentView('dashboard');
          }
          if (u) loadClinicalData();
        }}
        onRefreshData={refreshCurrentPatient}
      />

      {/* Global Error / Permission Banner */}
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            padding: '0.6rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#991b1b',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️ {errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#991b1b',
              fontWeight: 700,
              fontSize: '1rem'
            }}
            title="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <main className="main-content">
        {/* Render View Based on currentView */}
        {currentView === 'dashboard' && currentUser && (
          <div style={{ flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
            {currentUser.role === 'JUNIOR_DOCTOR' && (
              <JuniorDashboard
                currentUser={currentUser}
                patients={patients}
                approaches={approaches}
                onOpenPatientRecord={handleOpenPatientRecord}
                onNavigateToApproach={(approachId) => {
                  if (approachId) setSelectedApproachId(approachId);
                  setCurrentView('approach');
                }}
              />
            )}

            {currentUser.role === 'SENIOR_DOCTOR' && (
              <SeniorDashboard
                currentUser={currentUser}
                patients={patients}
                onOpenPatientRecord={handleOpenPatientRecord}
              />
            )}

            {currentUser.role === 'SPECIALIST' && (
              <SpecialistDashboard
                currentUser={currentUser}
                patients={patients}
                onOpenPatientRecord={handleOpenPatientRecord}
                onRespondReferral={(pId, ref) => {
                  setSelectedPatientId(pId);
                  setRespondReferralTarget(ref);
                }}
              />
            )}
          </div>
        )}

        {/* View 2: Shared Patient Page (Same Patient Record across all 3 roles) */}
        {currentView === 'patient' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Patient Selection Sidebar */}
            <PatientSidebar
              patients={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={(id) => setSelectedPatientId(id)}
            />

            {/* Shared Patient Clinical Workspace */}
            <section className="workspace">
              {patientDetails && currentUser ? (
                <SharedPatientPage
                  currentUser={currentUser}
                  patient={patientDetails}
                  onRefreshPatient={refreshCurrentPatient}
                  onOpenAddEvent={() => setIsAddEventOpen(true)}
                  onOpenNewPrescription={() => setIsNewRxOpen(true)}
                  onOpenChangePrescription={(rx) => setChangeRxTarget(rx)}
                  onOpenAdminister={(rx) => setAdministerTarget(rx)}
                  onStopPrescription={handleStopPrescription}
                  onOpenOrderInvestigation={() => setIsOrderInvOpen(true)}
                  onOpenRecordResult={(inv) => setRecordResultTarget(inv)}
                  onOpenCreateReferral={() => setIsCreateReferralOpen(true)}
                  onOpenRespondReferral={(ref) => setRespondReferralTarget(ref)}
                  onOpenCreateCommunication={() => setIsCreateCommOpen(true)}
                />
              ) : (
                <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', margin: '1rem' }}>
                  {errorMessage ? (
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.4rem' }}>
                        Access Restricted
                      </h3>
                      <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.8rem', color: '#64748b' }}>
                        {errorMessage}
                      </p>
                    </div>
                  ) : patients.length === 0 ? (
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                        No Authorized Patient Records
                      </h3>
                      <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.8rem', color: '#64748b' }}>
                        You currently do not have any patients referred or assigned to your service.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                        Select a Patient Record
                      </h3>
                      <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '0.8rem', color: '#64748b' }}>
                        Select a patient from the sidebar to open the shared clinical record.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* View 3: Senior Approach Library (Accessible ONLY on Junior Doctor experience) */}
        {currentView === 'approach' && currentUser?.role === 'JUNIOR_DOCTOR' && (
          <div style={{ flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
            <SeniorApproachSection
              approaches={approaches}
              initialSelectedId={selectedApproachId}
              onOpenPatientRecord={handleOpenPatientRecord}
              currentUserRole={currentUser?.role}
            />
          </div>
        )}
      </main>

      {/* Clinical Action Modals */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onSubmit={handleAddEvent}
      />

      <NewPrescriptionModal
        isOpen={isNewRxOpen}
        onClose={() => setIsNewRxOpen(false)}
        onSubmit={handleCreatePrescription}
      />

      <ChangePrescriptionModal
        isOpen={!!changeRxTarget}
        prescription={changeRxTarget}
        onClose={() => setChangeRxTarget(null)}
        onSubmit={handleChangePrescription}
      />

      <AdministerModal
        isOpen={!!administerTarget}
        prescription={administerTarget}
        onClose={() => setAdministerTarget(null)}
        onSubmit={handleAdministerMedication}
      />

      <OrderInvestigationModal
        isOpen={isOrderInvOpen}
        onClose={() => setIsOrderInvOpen(false)}
        onSubmit={handleOrderInvestigation}
      />

      <RecordResultModal
        isOpen={!!recordResultTarget}
        investigation={recordResultTarget}
        onClose={() => setRecordResultTarget(null)}
        onSubmit={handleRecordResult}
      />

      <CreateReferralModal
        isOpen={isCreateReferralOpen}
        doctors={doctors}
        onClose={() => setIsCreateReferralOpen(false)}
        onSubmit={handleCreateReferral}
      />

      <RespondReferralModal
        isOpen={!!respondReferralTarget}
        referral={respondReferralTarget}
        onClose={() => setRespondReferralTarget(null)}
        onSubmit={handleRespondReferral}
      />

      <CreateCommunicationModal
        isOpen={isCreateCommOpen}
        doctors={doctors}
        onClose={() => setIsCreateCommOpen(false)}
        onSubmit={handleCreateCommunication}
      />

      <ShareSeniorApproachModal
        isOpen={isShareApproachOpen}
        patient={patientDetails}
        onClose={() => setIsShareApproachOpen(false)}
        onSubmit={handleShareSeniorApproach}
      />
    </div>
  );
};
