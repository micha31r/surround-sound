import { deleteObject, getDownloadURL, ref, uploadBytes, uploadString } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { FirebaseStorage, UploadResult } from "firebase/storage";
import Promise from 'promise'

/**
 * Upload image from file object
 * @param {FirebaseStorage} storage - Firebase storage object
 * @param {File} file - File object of the image
 * @param {string} bucket - Name of the storage bucket/folder
 * @param {string} name - Name of the file
 * @param {string} userId - User ID to associate with the image
 * @returns {Promise<UploadResult>} - Snapshot of the storage reference
 */
export async function uploadImageFromFile(storage, file, bucket, name, userId) {
  name = name || uuidv4()
  const storageRef = ref(storage, `${bucket}/${name}`)

  try {
    const snapshot = await uploadBytes(storageRef, file, { customMetadata: { userId } })
    console.log('Successfully uploaded image.')
    return snapshot
  } catch (error) {
    console.error('Error uploading image from file object: ', error)
  }
}

/**
 * Upload image from data URL
 * @param {FirebaseStorage} storage - Firebase storage object
 * @param {string} dataURL - Data URL representation of image
 * @param {string} bucket - Name of the storage bucket/folder
 * @param {string} name - Name of the file
 * @returns {Promise<UploadResult>} - Snapshot of the storage reference
 */
// export async function uploadImageFromDataURL(storage, dataURL, bucket, name) {
//   name = name || uuidv4()
//   const storageRef = ref(storage, `${bucket}/${name}`)

//   try {
//     const snapshot = await uploadString(storageRef, dataURL, 'data_url')
//     console.log('Successfully uploaded image.')
//     return snapshot
//   } catch (error) {
//     console.error('Error uploading image from data URL: ', error)
//   }
// }

/**
 * Get image download URL
 * @param {FirebaseStorage} storage - Firebase storage object
 * @param {string} bucket - Name of the storage bucket, or full path if name is not provided
 * @param {string|undefined} name - Name of the file (optional)
 * @returns {Promise<string>} - Image download URL
 */
export async function getImageURL(storage, bucket, name) {
  const fullPath = name 
    ? `${bucket}/${name}`
    : bucket

  const storageRef = ref(storage, fullPath)

  try {
    const url = await getDownloadURL(storageRef)
    return url
  } catch (error) {
    // console.error('Error getting image download URL: ', error)
  }
}

/**
 * Delete image
 * @param {FirebaseStorage} storage - Firebase storage object
 * @param {string} bucket - Name of the storage bucket, or full path if name is not provided
 * @param {string|undefined} name - Name of the file (optional)
 */
export async function deleteImage(storage, bucket, name) {
  const fullPath = name 
    ? `${bucket}/${name}`
    : bucket

  const storageRef = ref(storage, fullPath)

  try {
    await deleteObject(storageRef)
  } catch (error) {
    console.error('Error deleting image: ', error)
  }
}