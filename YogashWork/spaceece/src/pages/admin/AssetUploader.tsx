import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Image as ImageIcon, Download } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { adminService } from '../../services/admin.service';
import { useAuthStore } from '../../store/authStore';
import { AnimatedButton } from '../../components/AnimatedButton';

const AssetUploader = () => {
  const { user } = useAuthStore();
  const { assets, setAssets, addAsset, deleteAsset: deleteAssetFromStore, setLoading } =
    useAdminStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState<'coloring-template' | 'story-scene' | 'character' | 'prop'>('coloring-template');
  const [category, setCategory] = useState('animals');
  const [filterCategory, setFilterCategory] = useState('all');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const assetsData = await adminService.getAssets();
      setAssets(assetsData);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    try {
      setLoading(true);
      const asset = await adminService.uploadAsset(
        selectedFile,
        assetType,
        category,
        user.id
      );
      addAsset(asset);
      setSelectedFile(null);
      setPreview(null);
      alert('Asset uploaded successfully!');
    } catch (error) {
      console.error('Error uploading asset:', error);
      alert('Error uploading asset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      setLoading(true);
      await adminService.deleteAsset(id, url);
      deleteAssetFromStore(id);
    } catch (error) {
      console.error('Error deleting asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets =
    filterCategory === 'all'
      ? assets
      : assets.filter((asset) => asset.category === filterCategory);

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-dark mb-2">Asset Uploader</h1>
          <p className="text-gray-600">Manage templates and media assets</p>
        </div>

        {/* Upload Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-extrabold text-dark mb-4">Upload New Asset</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Asset Type
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as any)}
                  className="input-field"
                >
                  <option value="coloring-template">Coloring Template</option>
                  <option value="story-scene">Story Scene</option>
                  <option value="character">Character</option>
                  <option value="prop">Prop</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="animals">Animals</option>
                  <option value="nature">Nature</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="people">People</option>
                  <option value="objects">Objects</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>

              <AnimatedButton
                onClick={handleUpload}
                disabled={!selectedFile}
                icon={<Upload size={20} />}
                className="w-full"
              >
                Upload Asset
              </AnimatedButton>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center bg-light-cream rounded-2xl p-8">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-64 object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon size={64} className="mx-auto mb-3" />
                  <p>No file selected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="card mb-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field md:w-64"
          >
            <option value="all">All Categories</option>
            <option value="animals">Animals</option>
            <option value="nature">Nature</option>
            <option value="vehicles">Vehicles</option>
            <option value="fantasy">Fantasy</option>
            <option value="people">People</option>
            <option value="objects">Objects</option>
          </select>
        </div>

        {/* Assets Grid */}
        <h2 className="text-2xl font-extrabold text-dark mb-4">Uploaded Assets ({filteredAssets.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card"
            >
              <img
                src={asset.thumbnailUrl}
                alt={asset.title}
                className="w-full h-40 object-cover rounded-xl mb-3"
              />
              <h3 className="font-semibold text-dark text-sm mb-1 truncate">
                {asset.title}
              </h3>
              <p className="text-xs text-gray-600 mb-1 capitalize">{asset.type.replace('-', ' ')}</p>
              <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg mb-3">
                {asset.category}
              </span>

              <div className="flex gap-2">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-info/10 text-info rounded-xl text-xs font-semibold hover:bg-info/20 transition-colors"
                >
                  <Download size={14} />
                  View
                </a>
                <button
                  onClick={() => handleDelete(asset.id, asset.url)}
                  className="px-3 py-2 bg-error/10 text-error rounded-xl hover:bg-error/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="card text-center py-12">
            <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No assets uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetUploader;
