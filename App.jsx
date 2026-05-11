import React, { useState, useEffect } from 'react';

// ============================================================================
// ARCHITECTURE: LOCALIZATION SAFEGUARDS
// Eliminating hardcoded strings for multi-language scalability and easy edits.
// ============================================================================
const DICTIONARY = {
  en: {
    appTitle: "Dash Evo DevEx Auditor",
    appSubtitle: "pshenmic/dash-platform-sdk",
    description: "Validating data extraction capabilities utilizing the reverse-engineered Flattened API Topology and Discovered Signatures.",
    networkPanelTitle: "1. Network Verification",
    networkBtnIdle: "Check Node Status",
    networkBtnActive: "Pinging...",
    dpnsPanelTitle: "2. Fetch DPNS Name",
    dpnsBtnIdle: "Fetch",
    dpnsBtnActive: "...",
    contractPanelTitle: "3. Fetch Data Contract",
    contractBtnIdle: "Fetch",
    contractBtnActive: "...",
    identityPanelTitle: "4. Fetch Identity",
    identityBtnIdle: "Fetch",
    identityBtnActive: "...",
    introPanelTitle: "5. SDK API Introspection Engine",
    introBtnIdle: "Map Internal API Surface",
    introBtnActive: "Mapping API...",
    errorFallback: "An unexpected architecture fault occurred. Check console for stack trace.",
    sdkMissing: "Live SDK not detected in this environment. Falling back to Mock Introspection Engine for UI demonstration."
  }
};

// ============================================================================
// ARCHITECTURE: DEFENSIVE PROGRAMMING & MOCKING
// Ensuring the UI does not crash if the npm package is unavailable in Canvas.
// Updated to match the newly discovered method signatures.
// ============================================================================
class MockDashSDK {
  constructor(options) {
    this.network = options.network;
    this.names = { 
      searchByName: async (name) => ([{ toJSON: () => ({ label: name, ownerId: "mock-id-123", records: { dash: "valid" } }) }]) 
    };
    this.dataContracts = { 
      getDataContractByIdentifier: async (id) => ({ toJSON: () => ({ id, ownerId: "mock-owner-456", documentSchemas: { profile: { type: "object" } } }) }) 
    };
    this.identities = { 
      getIdentityByIdentifier: async (id) => ({ toJSON: () => ({ id, balance: 50000, publicKeys: [{ id: 0, type: "ECDSA_SECP256K1" }] }) }) 
    };
    this.node = { 
      status: async () => ({ version: "1.0.0-dev", status: "SYNCED", peerCount: 12 }) 
    };
  }
}

export default function App() {
  const t = DICTIONARY.en;
  
  // Defensive State Management
  const [sdkReference, setSdkReference] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Payload States
  const [searchName, setSearchName] = useState('alice');
  const [nameData, setNameData] = useState(null);
  const [nameLoading, setNameLoading] = useState(false);

  const [contractId, setContractId] = useState('GWRSAVFMjXx8HpQFaNJMqjEPnZGoyVFFjcPSsfcxhoCw');
  const [contractData, setContractData] = useState(null);
  const [contractLoading, setContractLoading] = useState(false);

  const [identityId, setIdentityId] = useState('4w3aB1GqZCTaM1iWMBV7R5iYp1D2p4E4M6H3t7Z8h9Xo');
  const [identityData, setIdentityData] = useState(null);
  const [identityLoading, setIdentityLoading] = useState(false);

  const [apiSurface, setApiSurface] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Initialize SDK with Defensive Fallback
  useEffect(() => {
    const initSDK = async () => {
      try {
        // Attempt dynamic import of the real SDK
        const { DashPlatformSDK } = await import('dash-platform-sdk');
        setSdkReference(() => DashPlatformSDK);
      } catch (err) {
        console.warn(t.sdkMissing);
        setSdkReference(() => MockDashSDK);
      }
    };
    initSDK();
  }, [t.sdkMissing]);

  // Utility: Defensive Execution Wrapper
  const executeSafely = async (setLoadingState, setDataState, operation) => {
    if (!sdkReference) return;
    setLoadingState(true);
    setDataState(null);
    setError(null);
    try {
      const SDKClass = sdkReference;
      const sdk = new SDKClass({ network: 'testnet' });
      const result = await operation(sdk);
      setDataState(result);
    } catch (err) {
      console.error("Execution Fault:", err);
      setError(err.message || t.errorFallback);
    } finally {
      setLoadingState(false);
    }
  };

  const checkConnection = () => {
    executeSafely(setLoading, setStatus, async (sdk) => {
      return await sdk.node.status();
    });
  };

  const resolveDPNSName = () => {
    if (!searchName.trim()) return;
    executeSafely(setNameLoading, setNameData, async (sdk) => {
      // Re-mapped to searchByName based on Introspection Payload
      if (sdk.names && typeof sdk.names.searchByName === 'function') {
        const documents = await sdk.names.searchByName(`${searchName}.dash`);
        return Array.isArray(documents) 
          ? documents.map(doc => typeof doc.toJSON === 'function' ? doc.toJSON() : doc)
          : (typeof documents.toJSON === 'function' ? documents.toJSON() : documents);
      }
      throw new Error("SDK Architecture Fault: sdk.names.searchByName() is missing.");
    });
  };

  const fetchContract = () => {
    if (!contractId.trim()) return;
    executeSafely(setContractLoading, setContractData, async (sdk) => {
      // Re-mapped to getDataContractByIdentifier based on Introspection Payload
      if (sdk.dataContracts && typeof sdk.dataContracts.getDataContractByIdentifier === 'function') {
        const contract = await sdk.dataContracts.getDataContractByIdentifier(contractId);
        return contract && typeof contract.toJSON === 'function' ? contract.toJSON() : contract;
      }
      throw new Error("SDK Architecture Fault: sdk.dataContracts.getDataContractByIdentifier() is missing.");
    });
  };

  const fetchIdentity = () => {
    if (!identityId.trim()) return;
    executeSafely(setIdentityLoading, setIdentityData, async (sdk) => {
      // Re-mapped to getIdentityByIdentifier based on Introspection Payload
      if (sdk.identities && typeof sdk.identities.getIdentityByIdentifier === 'function') {
        const identity = await sdk.identities.getIdentityByIdentifier(identityId);
        return identity && typeof identity.toJSON === 'function' ? identity.toJSON() : identity;
      }
      throw new Error("SDK Architecture Fault: sdk.identities.getIdentityByIdentifier() is missing.");
    });
  };

  const runIntrospection = () => {
    executeSafely(setApiLoading, setApiSurface, async (sdk) => {
      const extractMethods = (obj) => {
        if (!obj) return null;
        let props = new Set();
        let currentObj = obj;
        do {
          Object.getOwnPropertyNames(currentObj).forEach(p => props.add(p));
        } while ((currentObj = Object.getPrototypeOf(currentObj)) && currentObj !== Object.prototype);
        
        const result = { methods: [], properties: [] };
        Array.from(props).filter(p => !p.startsWith('_')).forEach(p => {
          try {
            if (typeof obj[p] === 'function') result.methods.push(p);
            else result.properties.push(p);
          } catch (e) {
            result.properties.push(`${p} (Protected Getter)`);
          }
        });
        return result;
      };

      const surface = {
        constructorName: sdk.constructor.name,
        rootLevel: extractMethods(sdk),
        namespaces: {}
      };

      const targetNamespaces = ['platform', 'names', 'dataContracts', 'identities', 'dapiClient', 'core'];
      targetNamespaces.forEach(ns => {
        surface.namespaces[ns] = sdk[ns] ? extractMethods(sdk[ns]) : 'UNDEFINED_IN_THIS_TOPOLOGY';
      });

      return surface;
    });
  };

  // UI Components
  const StatusIndicator = ({ isLoading }) => (
    isLoading ? (
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ) : null
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans flex flex-col items-center">
      <div className="max-w-6xl w-full bg-white p-6 md:p-10 rounded-2xl shadow-xl ring-1 ring-slate-900/5">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">{t.appTitle}</h1>
          </div>
          <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full ring-1 ring-blue-700/10">
            {t.appSubtitle}
          </span>
        </div>
        
        <p className="mb-10 text-slate-600 text-lg leading-relaxed max-w-3xl">
          {t.description}
        </p>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div className="text-red-800 font-medium">{error}</div>
          </div>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Network Diagnostics */}
          <div className="bg-slate-50 p-6 rounded-2xl ring-1 ring-slate-200 hover:ring-slate-300 transition-all">
            <h2 className="text-lg font-bold mb-4 flex items-center text-slate-800">
              <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {t.networkPanelTitle}
            </h2>
            <button 
              onClick={checkConnection}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-70 transition-all shadow-sm active:scale-[0.98]"
            >
              <StatusIndicator isLoading={loading} />
              {loading ? t.networkBtnActive : t.networkBtnIdle}
            </button>
          </div>

          {/* DPNS Resolver */}
          <div className="bg-blue-50/50 p-6 rounded-2xl ring-1 ring-blue-100 hover:ring-blue-200 transition-all">
            <h2 className="text-lg font-bold mb-4 flex items-center text-blue-900">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              {t.dpnsPanelTitle}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl border-0 ring-1 ring-blue-200 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium"
              />
              <button 
                onClick={resolveDPNSName}
                disabled={nameLoading}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all shadow-sm active:scale-[0.98]"
              >
                <StatusIndicator isLoading={nameLoading} />
                {nameLoading ? t.dpnsBtnActive : t.dpnsBtnIdle}
              </button>
            </div>
          </div>

          {/* Data Contract Inspector */}
          <div className="bg-purple-50/50 p-6 rounded-2xl ring-1 ring-purple-100 hover:ring-purple-200 transition-all">
            <h2 className="text-lg font-bold mb-4 flex items-center text-purple-900">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              {t.contractPanelTitle}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl border-0 ring-1 ring-purple-200 focus:ring-2 focus:ring-purple-500 bg-white shadow-sm font-mono text-sm"
              />
              <button 
                onClick={fetchContract}
                disabled={contractLoading}
                className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-70 transition-all shadow-sm active:scale-[0.98]"
              >
                <StatusIndicator isLoading={contractLoading} />
                {contractLoading ? t.contractBtnActive : t.contractBtnIdle}
              </button>
            </div>
          </div>

          {/* Identity Inspector */}
          <div className="bg-emerald-50/50 p-6 rounded-2xl ring-1 ring-emerald-100 hover:ring-emerald-200 transition-all">
            <h2 className="text-lg font-bold mb-4 flex items-center text-emerald-900">
              <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {t.identityPanelTitle}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={identityId}
                onChange={(e) => setIdentityId(e.target.value)}
                className="flex-grow px-4 py-3 rounded-xl border-0 ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm font-mono text-sm"
              />
              <button 
                onClick={fetchIdentity}
                disabled={identityLoading}
                className="flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-70 transition-all shadow-sm active:scale-[0.98]"
              >
                <StatusIndicator isLoading={identityLoading} />
                {identityLoading ? t.identityBtnActive : t.identityBtnIdle}
              </button>
            </div>
          </div>
        </div>

        {/* Introspection Engine Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 md:p-8 rounded-2xl ring-1 ring-amber-200 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center text-amber-900">
              <svg className="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
              {t.introPanelTitle}
            </h2>
            <p className="text-amber-700/80 text-sm font-medium">Dynamically reverse-engineers the loaded SDK memory map.</p>
          </div>
          <button 
            onClick={runIntrospection}
            disabled={apiLoading}
            className="w-full md:w-auto flex items-center justify-center px-8 py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 whitespace-nowrap"
          >
            <StatusIndicator isLoading={apiLoading} />
            {apiLoading ? t.introBtnActive : t.introBtnIdle}
          </button>
        </div>

        {/* Output Payloads */}
        <div className="space-y-6">
          
          {apiSurface && (
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-900/10">
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <h3 className="text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                  SDK Reflection Payload
                </h3>
              </div>
              <div className="bg-slate-950 p-6">
                <pre className="text-amber-200/90 text-sm font-mono overflow-x-auto max-h-[600px] custom-scrollbar">
                  {JSON.stringify(apiSurface, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {status && (
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-900/10">
              <div className="bg-slate-800 px-6 py-3 border-b border-slate-700">
                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-wider">Network Diagnostics Payload</h3>
              </div>
              <div className="bg-slate-900 p-6">
                <pre className="text-slate-300 text-sm font-mono overflow-x-auto">{JSON.stringify(status, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {nameData && (
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-blue-900/20">
              <div className="bg-slate-800 px-6 py-3 border-b border-blue-900/50">
                <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider">DPNS Registry Result</h3>
              </div>
              <div className="bg-slate-900 p-6">
                <pre className="text-blue-300/90 text-sm font-mono overflow-x-auto max-h-[400px]">{JSON.stringify(nameData, null, 2)}</pre>
              </div>
            </div>
          )}

          {contractData && (
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-purple-900/20">
              <div className="bg-slate-800 px-6 py-3 border-b border-purple-900/50">
                <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider">Contract Payload Result</h3>
              </div>
              <div className="bg-slate-900 p-6">
                <pre className="text-purple-300/90 text-sm font-mono overflow-x-auto max-h-[400px]">{JSON.stringify(contractData, null, 2)}</pre>
              </div>
            </div>
          )}

          {identityData && (
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-emerald-900/20">
              <div className="bg-slate-800 px-6 py-3 border-b border-emerald-900/50">
                <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Identity Document Result</h3>
              </div>
              <div className="bg-slate-900 p-6">
                <pre className="text-emerald-300/90 text-sm font-mono overflow-x-auto max-h-[400px]">{JSON.stringify(identityData, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
