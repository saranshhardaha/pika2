import JSZip from 'jszip';

export async function downloadImages(urls: string[], selectedOnly = false) {
  const zip = new JSZip();
  
  try {
    // Download all images
    const imagePromises = urls.map(async (url, index) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = `image-${index + 1}.${blob.type.split('/')[1]}`;
      zip.file(fileName, blob);
    });

    await Promise.all(imagePromises);

    // Generate and download zip file
    const content = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(content);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = selectedOnly ? 'selected-images.zip' : 'all-images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading images:', error);
    throw error;
  }
}