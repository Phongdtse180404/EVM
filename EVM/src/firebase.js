// Firebase initialization and small Storage helpers
// Uses Vite environment variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
// VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDQfu9zKdRbvHUo-AeB7TMgij8Gf5HcPjA",
  authDomain: "evdealer.firebaseapp.com",
  projectId: "evdealer",
  storageBucket: "evdealer.firebasestorage.app",
  messagingSenderId: "985379226549",
  appId: "1:985379226549:web:920c07dfda1575292e0ffc",
  measurementId: "G-XS2LESMVPX"
};

// Initialize Firebase app (safe to call multiple times in dev/hot reload)
let app;
try {
	app = initializeApp(firebaseConfig);
} catch (e) {
	// initializeApp throws if called multiple times in some setups; ignore in that case
	// (Vite HMR may re-run this file)
	// eslint-disable-next-line no-console
	console.warn("Firebase app initialization warning:", e?.message || e);
}

const storage = getStorage(app);

/**
 * List images (and files) under a Storage path and return array of objects { name, fullPath, url }
 * @param {string} path - storage path (folder) e.g. 'images/vehicles'
 * @returns {Promise<Array<{name:string, fullPath:string, url:string}>>}
 */
export async function listImages(path = "") {
	try {
		const listRef = ref(storage, path);
		const res = await listAll(listRef);

		const items = await Promise.all(
			res.items.map(async (itemRef) => {
				const url = await getDownloadURL(itemRef);
				return {
					name: itemRef.name,
					fullPath: itemRef.fullPath,
					url,
				};
			})
		);

		return items;
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Failed to list images from Firebase Storage:", err);
		return [];
	}
}

/**
 * Get a download URL for a single storage file path
 * @param {string} filePath - full storage path, e.g. 'images/vehicles/vf8.jpg'
 * @returns {Promise<string|null>} download URL or null on error
 */
export async function getImageUrl(filePath) {
	try {
		const imageRef = ref(storage, filePath);
		const url = await getDownloadURL(imageRef);
		return url;
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error("Failed to get image url from Firebase Storage:", err);
		return null;
	}
}

export { storage };

