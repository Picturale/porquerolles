import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function reportPost(postId, userId, severity = 1) {
  if (!postId || !userId) throw new Error('missing_params');
  const sev = Math.max(1, Math.min(3, Number(severity || 1)));
  const payload = {
    postId: String(postId),
    userId: String(userId),
    severity: sev,
    createdAt: serverTimestamp(),
  };
  const col = collection(db, 'reports');
  const res = await addDoc(col, payload);
  return res.id;
}
