import {
  collection, addDoc, getDocs, deleteDoc, doc,
  serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db, isConfigured } from "./config.js";

function col(name) { return collection(db, name); }

async function getAll(name) {
  if (!isConfigured) return [];
  // No orderBy — avoids needing Firestore indexes; sort client-side instead.
  const snap = await getDocs(col(name));
  const docs = snap.docs.map((d) => ({ _fbId: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

async function add(name, data) {
  if (!isConfigured) throw new Error("Firebase not configured — add credentials to .env");
  return await addDoc(col(name), { ...data, createdAt: serverTimestamp() });
}

async function update(name, id, data) {
  if (!isConfigured) return;
  await updateDoc(doc(db, name, id), data);
}

async function remove(name, id) {
  if (!isConfigured) return;
  await deleteDoc(doc(db, name, id));
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export const fbProjects = {
  getAll: () => getAll("projects"),
  add:    (d) => add("projects", d),
  update: (id, d) => update("projects", id, d),
  remove: (id) => remove("projects", id),
};

// ─── Brands (partners) ────────────────────────────────────────────────────────
export const fbBrands = {
  getAll: () => getAll("brands"),
  add:    (d) => add("brands", d),
  update: (id, d) => update("brands", id, d),
  remove: (id) => remove("brands", id),
};

// ─── Shop Products ────────────────────────────────────────────────────────────
export const fbProducts = {
  getAll: () => getAll("products"),
  add:    (d) => add("products", d),
  update: (id, d) => update("products", id, d),
  remove: (id) => remove("products", id),
};
