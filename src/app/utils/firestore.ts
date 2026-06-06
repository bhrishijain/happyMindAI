/* MindTrack Firestore Database Simulation Layer */

export interface FirebaseAssessmentEntry {
  id?: string;
  timestamp: string; // ISO string
  date: string;      // YYYY-MM-DD
  mood: "Great" | "Good" | "Okay" | "Stressed" | "Overwhelmed";
  anxietyScore: number;     // 1-10
  confidenceScore: number;   // 1-10
  sleepHours: number;
  studyHours: number;
  biggestConcern: string;
  focusGoal: string;
  wellnessScore: number;    // 0-100
}

class MockFirestoreCollection {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  private getStoredData(): any[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(`firestore_mock_${this.path}`);
    return raw ? JSON.parse(raw) : [];
  }

  private setStoredData(data: any[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`firestore_mock_${this.path}`, JSON.stringify(data));
  }

  /**
   * Adds a new document to the collection (Simulates Firestore addDoc)
   */
  async add(data: any): Promise<{ id: string }> {
    // Simulate cloud round-trip delay (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const docs = this.getStoredData();
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDoc = { id, ...data };
    
    docs.push(newDoc);
    this.setStoredData(docs);
    
    return { id };
  }

  /**
   * Fetches all documents from the collection (Simulates Firestore getDocs)
   */
  async get(): Promise<{ docs: Array<{ id: string; data: () => any }> }> {
    // Simulate cloud round-trip delay (400ms)
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const docs = this.getStoredData();
    
    return {
      docs: docs.map((doc) => {
        const { id, ...fields } = doc;
        return {
          id,
          data: () => fields
        };
      })
    };
  }

  /**
   * Deletes a document by ID (Simulates Firestore deleteDoc)
   */
  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const docs = this.getStoredData();
    const filtered = docs.filter((doc) => doc.id !== id);
    this.setStoredData(filtered);
  }

  /**
   * Overwrites the collection data entirely (Useful for seeding mock data)
   */
  seed(data: any[]) {
    this.setStoredData(data);
  }
}

export class MockFirestore {
  collection(path: string) {
    return new MockFirestoreCollection(path);
  }
}

export const db = new MockFirestore();
