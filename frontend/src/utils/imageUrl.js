export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('data:')) return path;

    // Ensure path starts with /
    let cleanPath = path.replace(/^(\.\/)?user-images\/?|\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;

    // Backend server URL proxy
    const baseUrl = '/api/images';

    return `${baseUrl}${cleanPath}`;
};
