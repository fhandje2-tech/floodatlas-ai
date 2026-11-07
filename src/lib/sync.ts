import { useAgentStore } from '../stores/agentStore';
import { auth, db } from './firebase';
import { doc, setDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreErrors';

let isSyncingFromRemote = false;

export function initFirebaseSync() {
  // Listen for Auth changes to load projects
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      isSyncingFromRemote = true;
      const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const remoteProjects: any = {};
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        remoteProjects[docSnap.id] = {
          id: docSnap.id,
          name: data.name || "Untitled",
          activeZone: data.zone || null,
          role: data.role || "",
          context: data.context || "",
          diagnosticPriorities: data.diagnosticPriorities || [],
          criticalInfrastructures: data.criticalInfrastructures ? (typeof data.criticalInfrastructures === 'string' ? JSON.parse(data.criticalInfrastructures) : data.criticalInfrastructures) : [],
          selectedLevers: data.selectedLevers || [],
          resilienceIndex: data.resilienceIndex || 45,
          messages: data.messages ? (typeof data.messages === 'string' ? JSON.parse(data.messages) : data.messages) : [],
          lastScenario: data.lastScenario ? (typeof data.lastScenario === 'string' ? JSON.parse(data.lastScenario) : data.lastScenario) : null,
          scenarioAssumptions: data.scenarioAssumptions ? (typeof data.scenarioAssumptions === 'string' ? JSON.parse(data.scenarioAssumptions) : data.scenarioAssumptions) : null,
          scenarioImage: data.scenarioImage || null,
          lastAnalysis: data.lastAnalysis ? (typeof data.lastAnalysis === 'string' ? JSON.parse(data.lastAnalysis) : data.lastAnalysis) : null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });

      // Update local store with fetched projects
      useAgentStore.setState((state) => ({
        projects: { ...state.projects, ...remoteProjects },
      }));
      
      isSyncingFromRemote = false;
    }
  });

  // Subscribe to local store changes to save back to Firestore
  useAgentStore.subscribe((state, prevState) => {
    if (isSyncingFromRemote || !auth.currentUser) return;
    
    const currentUser = auth.currentUser;
    // Compare projects to find which one updated
    for (const projectId of Object.keys(state.projects)) {
      const proj = state.projects[projectId];
      const prevProj = prevState.projects[projectId];
      
      if (proj !== prevProj && prevProj) {
        // Sync project update to Firestore
        setDoc(doc(db, 'projects', projectId), {
          ownerId: currentUser.uid,
          name: proj.name,
          zone: proj.activeZone,
          context: proj.context || "",
          diagnosticPriorities: proj.diagnosticPriorities || [],
          criticalInfrastructures: JSON.stringify(proj.criticalInfrastructures || []),
          selectedLevers: proj.selectedLevers || [],
          resilienceIndex: proj.resilienceIndex || 45,
          messages: JSON.stringify(proj.messages || []),
          lastScenario: proj.lastScenario ? JSON.stringify(proj.lastScenario) : null,
          scenarioAssumptions: proj.scenarioAssumptions ? JSON.stringify(proj.scenarioAssumptions) : null,
          scenarioImage: proj.scenarioImage || null,
          lastAnalysis: proj.lastAnalysis ? JSON.stringify(proj.lastAnalysis) : null,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(err => {
          console.error("Firestore sync error:", err);
          handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
        });
      }
    }
  });
}
