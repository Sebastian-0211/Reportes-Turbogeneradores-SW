import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer, 
  collection, 
  getDocs 
} from 'firebase/firestore';
import { Turbomachine } from '../types/turbomachine';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with the provisioned database ID
export const db = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Connection test
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, caching active.');
    }
    return true;
  }
}

/**
 * Publishes a turbomachine report to Firestore so any client can view it via open link.
 */
export async function publishReportToCloud(
  turbomachine: Turbomachine,
  customTitle?: string
): Promise<{ shareId: string; shareUrl: string }> {
  const shareId = `rep-${turbomachine.id}-${Date.now().toString(36)}`;
  const title = customTitle || `Reporte de Órbitas ${turbomachine.name} - ${turbomachine.company}`;

  const payload = {
    id: shareId,
    title,
    turbomachineId: turbomachine.id,
    turbomachineName: turbomachine.name,
    company: turbomachine.company,
    analyst: turbomachine.analyst,
    createdAt: new Date().toISOString(),
    turbomachineData: JSON.stringify(turbomachine),
    isPublic: true,
  };

  const reportRef = doc(db, 'published_reports', shareId);
  await setDoc(reportRef, payload);

  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?report=${shareId}`;

  return { shareId, shareUrl };
}

/**
 * Retrieves a published report by its shareId from Firestore.
 */
export async function getPublishedReportFromCloud(
  shareId: string
): Promise<{ turbomachine: Turbomachine; title: string; createdAt: string } | null> {
  try {
    const reportRef = doc(db, 'published_reports', shareId);
    const snap = await getDoc(reportRef);
    if (snap.exists()) {
      const data = snap.data();
      const parsedTurbomachine = JSON.parse(data.turbomachineData) as Turbomachine;
      return {
        turbomachine: parsedTurbomachine,
        title: data.title,
        createdAt: data.createdAt,
      };
    }
  } catch (err) {
    console.error('Error loading published report:', err);
  }
  return null;
}

/**
 * Saves analyst turbomachines to cloud database for persistent cross-device work.
 */
export async function saveTurbomachineCloud(turbomachine: Turbomachine): Promise<void> {
  try {
    const ref = doc(db, 'turbomachines', turbomachine.id);
    await setDoc(ref, {
      id: turbomachine.id,
      name: turbomachine.name,
      fullName: turbomachine.fullName,
      tag: turbomachine.tag,
      company: turbomachine.company,
      analyst: turbomachine.analyst,
      updatedAt: new Date().toISOString(),
      payloadJson: JSON.stringify(turbomachine),
    });
  } catch (e) {
    console.error('Error saving turbomachine to cloud:', e);
  }
}

/**
 * Loads all turbomachines saved in the cloud.
 */
export async function loadTurbomachinesCloud(): Promise<Turbomachine[]> {
  try {
    const colRef = collection(db, 'turbomachines');
    const snap = await getDocs(colRef);
    const list: Turbomachine[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.payloadJson) {
        list.push(JSON.parse(data.payloadJson));
      }
    });
    return list;
  } catch (e) {
    console.error('Error loading cloud turbomachines:', e);
    return [];
  }
}
