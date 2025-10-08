import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

class StorageService {
    /**
     * Upload establishment profile image
     */
    async uploadProfileImage(file: File, userId: string): Promise<string> {
        try {
            // Create a reference to the file in Firebase Storage
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const fileName = `${userId}_${timestamp}.${fileExtension}`;
            const storageRef = ref(storage, `establishment-profile/${fileName}`);

            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        } catch (error: any) {
            console.error('Error uploading profile image:', error);
            throw new Error(error.message || 'Failed to upload image');
        }
    }

    /**
     * Delete profile image from storage
     */
    async deleteProfileImage(imageUrl: string): Promise<void> {
        try {
            if (!imageUrl) return;

            // Extract the file path from the URL
            // URL format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?[params]
            const urlParts = imageUrl.split('/o/');
            if (urlParts.length < 2) {
                throw new Error('Invalid image URL format');
            }

            const pathWithParams = urlParts[1];
            const path = decodeURIComponent(pathWithParams.split('?')[0]);

            // Create a reference to the file
            const imageRef = ref(storage, path);

            // Delete the file
            await deleteObject(imageRef);
        } catch (error: any) {
            console.error('Error deleting profile image:', error);
            throw new Error(error.message || 'Failed to delete image');
        }
    }

    /**
     * Validate image file
     */
    validateImageFile(file: File): { valid: boolean; error?: string } {
        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
            };
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            return {
                valid: false,
                error: 'File size too large. Maximum size is 5MB.'
            };
        }

        return { valid: true };
    }
}

export const storageService = new StorageService();
