import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase/config';
import type {
  CognitiveGame,
  CreativityActivity,
  EmotionScenario,
  UploadedAsset,
  User,
  CognitiveScore,
  EmotionScore,
  AdminStats,
} from '../types';

// Cognitive Games
export const adminService = {
  // ===== GAMES =====
  async getGames(): Promise<CognitiveGame[]> {
    const gamesRef = collection(db, 'cognitive_games');
    const snapshot = await getDocs(query(gamesRef, orderBy('createdAt', 'desc')));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CognitiveGame));
  },

  async getGame(id: string): Promise<CognitiveGame | null> {
    const gameDoc = await getDoc(doc(db, 'cognitive_games', id));
    return gameDoc.exists() ? ({ id: gameDoc.id, ...gameDoc.data() } as CognitiveGame) : null;
  },

  async createGame(game: Omit<CognitiveGame, 'id' | 'createdAt'>): Promise<string> {
    const gamesRef = collection(db, 'cognitive_games');
    const docRef = await addDoc(gamesRef, {
      ...game,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateGame(id: string, updates: Partial<CognitiveGame>): Promise<void> {
    const gameRef = doc(db, 'cognitive_games', id);
    await updateDoc(gameRef, updates);
  },

  async deleteGame(id: string): Promise<void> {
    const gameRef = doc(db, 'cognitive_games', id);
    await deleteDoc(gameRef);
  },

  // ===== ACTIVITIES =====
  async getActivities(): Promise<CreativityActivity[]> {
    const activitiesRef = collection(db, 'creativity_activities');
    const snapshot = await getDocs(query(activitiesRef, orderBy('createdAt', 'desc')));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CreativityActivity));
  },

  async createActivity(activity: Omit<CreativityActivity, 'id' | 'createdAt'>): Promise<string> {
    const activitiesRef = collection(db, 'creativity_activities');
    const docRef = await addDoc(activitiesRef, {
      ...activity,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateActivity(id: string, updates: Partial<CreativityActivity>): Promise<void> {
    const activityRef = doc(db, 'creativity_activities', id);
    await updateDoc(activityRef, updates);
  },

  async deleteActivity(id: string): Promise<void> {
    const activityRef = doc(db, 'creativity_activities', id);
    await deleteDoc(activityRef);
  },

  // ===== EMOTION SCENARIOS =====
  async getScenarios(): Promise<EmotionScenario[]> {
    const scenariosRef = collection(db, 'emotion_activities');
    const snapshot = await getDocs(query(scenariosRef, orderBy('createdAt', 'desc')));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as EmotionScenario));
  },

  async createScenario(scenario: Omit<EmotionScenario, 'id' | 'createdAt'>): Promise<string> {
    const scenariosRef = collection(db, 'emotion_activities');
    const docRef = await addDoc(scenariosRef, {
      ...scenario,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateScenario(id: string, updates: Partial<EmotionScenario>): Promise<void> {
    const scenarioRef = doc(db, 'emotion_activities', id);
    await updateDoc(scenarioRef, updates);
  },

  async deleteScenario(id: string): Promise<void> {
    const scenarioRef = doc(db, 'emotion_activities', id);
    await deleteDoc(scenarioRef);
  },

  // ===== ASSETS =====
  async uploadAsset(
    file: File,
    type: 'coloring-template' | 'story-scene' | 'character' | 'prop',
    category: string,
    uploadedBy: string
  ): Promise<UploadedAsset> {
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${type}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, filename);

    // Upload file
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Generate thumbnail (simplified - in production use image processing)
    const thumbnailUrl = url; // TODO: Implement thumbnail generation

    // Save metadata to Firestore
    const assetsRef = collection(db, 'uploaded_assets');
    const docRef = await addDoc(assetsRef, {
      type,
      title: file.name,
      url,
      thumbnailUrl,
      category,
      uploadedBy,
      uploadedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      type,
      title: file.name,
      url,
      thumbnailUrl,
      category,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
    };
  },

  async getAssets(): Promise<UploadedAsset[]> {
    const assetsRef = collection(db, 'uploaded_assets');
    const snapshot = await getDocs(query(assetsRef, orderBy('uploadedAt', 'desc')));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UploadedAsset));
  },

  async deleteAsset(id: string, url: string): Promise<void> {
    // Delete from Storage
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);

    // Delete from Firestore
    const assetRef = doc(db, 'uploaded_assets', id);
    await deleteDoc(assetRef);
  },

  // ===== USERS & SCORES =====
  async getAllUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(query(usersRef, orderBy('createdAt', 'desc')));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  },

  async getUsersByRole(role: 'child' | 'parent' | 'admin'): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  },

  async getCognitiveScores(childId?: string): Promise<CognitiveScore[]> {
    const scoresRef = collection(db, 'cognitive_scores');
    const q = childId
      ? query(scoresRef, where('childId', '==', childId), orderBy('date', 'desc'))
      : query(scoresRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CognitiveScore));
  },

  async getEmotionScores(childId?: string): Promise<EmotionScore[]> {
    const scoresRef = collection(db, 'emotion_scores');
    const q = childId
      ? query(scoresRef, where('childId', '==', childId), orderBy('date', 'desc'))
      : query(scoresRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as EmotionScore));
  },

  // ===== ANALYTICS =====
  async getAdminStats(): Promise<AdminStats> {
    const [users, children, parents, games, activities, cognitiveScores, emotionScores] =
      await Promise.all([
        adminService.getAllUsers(),
        adminService.getUsersByRole('child'),
        adminService.getUsersByRole('parent'),
        adminService.getGames(),
        adminService.getActivities(),
        adminService.getCognitiveScores(),
        adminService.getEmotionScores(),
      ]);

    // Calculate average scores
    const avgCognitiveScore =
      cognitiveScores.length > 0
        ? cognitiveScores.reduce((sum, s) => sum + s.score, 0) / cognitiveScores.length
        : 0;

    const avgEmotionalScore =
      emotionScores.length > 0
        ? emotionScores.reduce((sum, s) => sum + s.score, 0) / emotionScores.length
        : 0;

    // Calculate active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = users.filter(
      (u) => new Date(u.lastLoginDate) >= sevenDaysAgo
    ).length;

    return {
      totalUsers: users.length,
      totalChildren: children.length,
      totalParents: parents.length,
      totalGames: games.length,
      totalActivities: activities.length,
      activeUsers,
      avgCognitiveScore: Math.round(avgCognitiveScore),
      avgEmotionalScore: Math.round(avgEmotionalScore),
    };
  },

  // ===== EXPORT =====
  async exportScoresToCSV(childId?: string): Promise<string> {
    const cognitiveScores = await adminService.getCognitiveScores(childId);
    const emotionScores = await adminService.getEmotionScores(childId);

    let csv = 'Type,Child ID,Activity,Score,Accuracy,Date\n';

    cognitiveScores.forEach((score) => {
      csv += `Cognitive,${score.childId},${score.gameType},${score.score},${score.accuracy}%,${score.date}\n`;
    });

    emotionScores.forEach((score) => {
      csv += `Emotional,${score.childId},${score.activityType},${score.score},${score.correct ? 100 : 0}%,${score.date}\n`;
    });

    return csv;
  },
};
