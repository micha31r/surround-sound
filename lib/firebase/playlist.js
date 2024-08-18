import { collection, Timestamp, where, query, getDocs, orderBy, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { deleteImage } from './storage';

// Create a new playlist
export async function createFBPlaylist(db, { userId, imagePath, spotifyPlaylistId, mood }) {
  try {
    const playlistCollection = collection(db, 'playlists')
    const playlistRef = doc(playlistCollection, spotifyPlaylistId)
    const playlist = await setDoc(playlistRef, {
      userId: userId,
      imagePath: imagePath,
      spotifyPlaylistId: spotifyPlaylistId,
      mood: mood,
      createdAt: Timestamp.now(),
    })
  } catch (error) {
    throw error
  }
}

// Get a playlist by ID
export async function getFBPlaylist(db, { playlistId }) {
  try {
    const playlistRef = doc(db, `playlists/${playlistId}`)
    const snapshot = await getDoc(playlistRef)
    return snapshot.data()
  } catch (error) {
    throw error
  }
}

// Get all playlists of a user
export async function getFBPlaylists(db, { userId }, limit = 50) {
  try {
    const playlistCollection = collection(db, 'playlists')
    let q = query(playlistCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data())
  } catch (error) {
    throw error
  }
}

// Delete a playlist
export async function deleteFBPlaylist(db, storage, { playlistId }) {
  const playlistRef = doc(db, `playlists/${playlistId}`)
  const playlistDoc = await getDoc(playlistRef)

  if (!playlistDoc.exists()) {
    return
  }

  const playlistData = playlistDoc.data()
  await deleteDoc(playlistRef)
  await deleteImage(storage, '',  playlistData.imagePath)
}