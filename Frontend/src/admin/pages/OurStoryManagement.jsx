import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

function imgUrl(path) {
  if (!path) return '/13_studio_table_ribbons.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `http://localhost:5050${path}`;
  return path;
}

export default function OurStoryManagement() {
  const { token } = useAuth();
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero Fields
  const [mainTitle, setMainTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);

  // Dynamic Sections Array: [{ id, title, paragraph, image, imageFile, imagePreview, reverse }]
  const [sections, setSections] = useState([]);

  // Confirm delete modal state
  const [deleteSectionTarget, setDeleteSectionTarget] = useState(null);

  useEffect(() => {
    fetchStory();
  }, []);

  async function fetchStory() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/our-story`);
      const data = await res.json();
      if (res.ok) {
        setMainTitle(data.mainTitle || '');
        setSubtitle(data.subtitle || '');
        setMainImage(data.mainImage || '/13_studio_table_ribbons.jpg');
        setMainImagePreview(null);
        setMainImageFile(null);

        const loadedSections = (data.sections || []).map((sec, idx) => ({
          id: sec.id || `sec-${idx + 1}-${Date.now()}`,
          title: sec.title || '',
          paragraph: sec.paragraph || '',
          image: sec.image || '/01_cream_linen_fabrics.jpg',
          imageFile: null,
          imagePreview: null,
          reverse: Boolean(sec.reverse),
        }));
        setSections(loadedSections);
      } else {
        toast.error(data.error || 'Failed to load Our Story content.');
      }
    } catch {
      toast.error('Network error loading Our Story content.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Main Hero Image Select
  function handleMainImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
  }

  // Add New Section
  function handleAddSection() {
    const nextIdx = sections.length + 1;
    setSections([
      ...sections,
      {
        id: `sec-${nextIdx}-${Date.now()}`,
        title: `Section ${nextIdx}: Handcrafted Beauty`,
        paragraph: 'Describe this special part of your artisanal story, craft tradition, and dedication to excellence.',
        image: '/01_cream_linen_fabrics.jpg',
        imageFile: null,
        imagePreview: null,
        reverse: nextIdx % 2 === 0,
      },
    ]);
    toast.success(`Section ${nextIdx} added!`);
  }

  // Update Section Field
  function handleSectionChange(index, field, value) {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  }

  // Update Section Image
  function handleSectionImageChange(index, e) {
    const file = e.target.files[0];
    if (!file) return;
    const updated = [...sections];
    updated[index].imageFile = file;
    updated[index].imagePreview = URL.createObjectURL(file);
    setSections(updated);
  }

  // Move Section Up/Down
  function handleMoveSection(index, direction) {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setSections(updated);
  }

  // Confirm and Remove Section
  function confirmRemoveSection() {
    if (deleteSectionTarget === null) return;
    setSections((prev) => prev.filter((_, idx) => idx !== deleteSectionTarget));
    setDeleteSectionTarget(null);
    toast.success('Section removed.');
  }

  // Upload file helper
  async function uploadImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: authHeaders,
      body: fd,
    });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.url;
  }

  // Save All Changes
  async function handleSave(e) {
    if (e) e.preventDefault();
    if (!mainTitle.trim()) {
      toast.error('Main Story Title cannot be empty.');
      return;
    }
    if (!subtitle.trim()) {
      toast.error('Subtitle / Intro cannot be empty.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Saving Our Story content & images...');

    try {
      // 1. Upload main image if a new file was chosen
      let finalMainImage = mainImage;
      if (mainImageFile) {
        finalMainImage = await uploadImage(mainImageFile);
      }

      // 2. Upload any section images that were changed
      const finalSections = await Promise.all(
        sections.map(async (sec) => {
          let secImage = sec.image;
          if (sec.imageFile) {
            secImage = await uploadImage(sec.imageFile);
          }
          return {
            id: sec.id,
            title: sec.title.trim(),
            paragraph: sec.paragraph.trim(),
            image: secImage,
            reverse: Boolean(sec.reverse),
          };
        })
      );

      // 3. Save to backend PUT /api/our-story
      const res = await fetch(`${API_BASE}/our-story`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainTitle: mainTitle.trim(),
          subtitle: subtitle.trim(),
          mainImage: finalMainImage,
          sections: finalSections,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Our Story page updated successfully!', { id: toastId });
        fetchStory(); // Reload clean state
      } else {
        toast.error(data.error || 'Failed to update Our Story.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error saving Our Story.', { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 w-full max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <span className="font-label-sm text-xs text-primary font-bold uppercase tracking-wider">
            Page Content CMS
          </span>
          <h1 className="font-headline-md text-xl sm:text-2xl md:text-headline-md text-on-background mt-0.5 font-bold">
            Edit "Our Story" Page
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            Customize the main brand narrative, hero images, and storytelling sections shown to customers.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/our-story"
            target="_blank"
            className="flex-1 sm:flex-initial p-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2 font-label-md text-xs cursor-pointer shadow-xs font-semibold"
            title="Preview live customer Our Story page"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Preview Client Page
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 sm:flex-initial bg-primary text-white font-label-md text-xs sm:text-sm py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-ambient font-bold cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-on-surface-variant space-y-3">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="font-body-md text-sm font-semibold">Loading Our Story content...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* ── CARD 1: HERO SECTION ── */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
                <div>
                  <h2 className="font-title-sm text-base sm:text-title-sm text-on-surface font-bold">
                    Hero Banner &amp; Header
                  </h2>
                  <p className="font-body-md text-xs text-on-surface-variant">
                    Main headline, introduction paragraph, and large wide banner photo
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-container text-primary text-xs font-bold rounded-full">
                Header
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Titles */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <label className="block font-label-md text-xs sm:text-sm text-on-surface mb-1.5 font-bold">
                    Main Headline Title <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                    placeholder="e.g. Born from Stillness, Crafted with Intention"
                    className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body-md text-sm sm:text-base text-on-surface focus:border-primary outline-none transition-colors shadow-inner"
                  />
                  <p className="text-xs text-on-surface-variant mt-1">
                    Tip: Use commas or short phrases. It displays in large luxury serif font on the homepage.
                  </p>
                </div>

                <div>
                  <label className="block font-label-md text-xs sm:text-sm text-on-surface mb-1.5 font-bold">
                    Story Subtitle / Introduction <span className="text-error">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Describe how Malmalee Creations began and the passion behind your boutique creations..."
                    className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body-md text-sm text-on-surface focus:border-primary outline-none transition-colors resize-y shadow-inner leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Column: Hero Cover Photo */}
              <div className="lg:col-span-5 space-y-3">
                <label className="block font-label-md text-xs sm:text-sm text-on-surface font-bold">
                  Hero Cover Banner Image
                </label>
                <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-4 bg-surface-container-low flex flex-col items-center justify-center text-center relative group overflow-hidden">
                  <img
                    src={mainImagePreview || imgUrl(mainImage)}
                    alt="Hero Preview"
                    className="w-full h-48 object-cover rounded-xl shadow-xs border border-outline-variant/30"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <label
                      htmlFor="hero-main-image-upload"
                      className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                      {mainImagePreview ? 'Change Photo' : 'Upload Hero Photo'}
                    </label>
                    <input
                      id="hero-main-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-2">
                    Recommended: 1200 × 600px high quality photography
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: STORY SECTIONS (DYNAMIC LIST) ── */}
          <div className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-3">
              <h2 className="font-headline-md text-lg sm:text-xl text-primary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl">view_agenda</span>
                Story Chapters &amp; Sections ({sections.length})
              </h2>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Each section features a high-resolution artisanal image paired with chapter text.
              </p>
            </div>

            {/* List of Dynamic Section Cards */}
            <div className="space-y-6">
              {sections.map((sec, index) => {
                const secNumber = index + 1;
                return (
                  <div
                    key={sec.id || index}
                    className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-6 relative transition-all"
                  >
                    {/* Section Top Bar: Index & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {secNumber}
                        </span>
                        <div>
                          <h3 className="font-title-sm text-base text-on-surface font-bold">
                            Section {secNumber}: {sec.title || 'Untitled Section'}
                          </h3>
                          <span className="text-xs text-on-surface-variant">
                            Layout: {sec.reverse ? 'Image on Right (Text Left)' : 'Image on Left (Text Right)'}
                          </span>
                        </div>
                      </div>

                      {/* Reorder and Delete Controls */}
                      <div className="flex items-center gap-2">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSection(index, 'up')}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move section up"
                        >
                          <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={index === sections.length - 1}
                          onClick={() => handleMoveSection(index, 'down')}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move section down"
                        >
                          <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                        </button>

                        {/* Orientation Toggle */}
                        <button
                          type="button"
                          onClick={() => handleSectionChange(index, 'reverse', !sec.reverse)}
                          className="px-3 py-1.5 text-xs font-label-md rounded-lg border border-outline-variant/60 hover:bg-surface-container text-on-surface-variant flex items-center gap-1.5 cursor-pointer font-semibold"
                          title="Switch between Image Left and Image Right"
                        >
                          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                          Flip Layout
                        </button>

                        {/* Remove Section */}
                        <button
                          type="button"
                          onClick={() => setDeleteSectionTarget(index)}
                          className="p-2 text-error hover:bg-error-container/30 rounded-lg cursor-pointer transition-colors"
                          title="Delete section"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Section Content Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left/Middle: Section Title and Paragraph */}
                      <div className="lg:col-span-8 space-y-4">
                        <div>
                          <label className="block font-label-sm text-xs text-on-surface-variant mb-1 font-semibold">
                            Section Title
                          </label>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                            placeholder={`e.g. Chapter ${secNumber}: The Hands Behind the Magic`}
                            className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface focus:border-primary outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-label-sm text-xs text-on-surface-variant mb-1 font-semibold">
                            Section Paragraph / Narrative Text
                          </label>
                          <textarea
                            rows={5}
                            value={sec.paragraph}
                            onChange={(e) => handleSectionChange(index, 'paragraph', e.target.value)}
                            placeholder="Write the story description for this section. Paragraph breaks (double enter) are supported automatically."
                            className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body-md text-sm text-on-surface focus:border-primary outline-none leading-relaxed resize-y"
                          />
                        </div>
                      </div>

                      {/* Right: Section Image Uploader */}
                      <div className="lg:col-span-4 space-y-3">
                        <label className="block font-label-sm text-xs text-on-surface-variant font-semibold">
                          Section Photo
                        </label>
                        <div className="border border-outline-variant/40 rounded-xl p-3 bg-surface-container-low flex flex-col items-center justify-center text-center">
                          <img
                            src={sec.imagePreview || imgUrl(sec.image)}
                            alt={`Section ${secNumber} Image`}
                            className="w-full aspect-[4/3] object-cover rounded-lg shadow-xs border border-outline-variant/30"
                          />
                          <div className="mt-3">
                            <label
                              htmlFor={`sec-img-upload-${index}`}
                              className="px-3.5 py-1.5 bg-surface-container-lowest border border-outline-variant hover:border-primary text-primary rounded-lg font-label-md text-xs font-bold hover:bg-primary-container/30 transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[15px]">add_photo_alternate</span>
                              {sec.imagePreview ? 'Change Image' : 'Select Photo'}
                            </label>
                            <input
                              id={`sec-img-upload-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSectionImageChange(index, e)}
                              className="hidden"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Section Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-primary text-primary font-label-md text-sm rounded-2xl hover:bg-primary-container/30 transition-all cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Another Story Section
              </button>
            </div>
          </div>

          {/* Sticky Bottom Save Bar */}
          <div className="sticky bottom-4 z-20 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
              <span className="material-symbols-outlined text-primary text-lg">info</span>
              <span>All changes will immediately reflect on the live customer website.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={fetchStory}
                disabled={saving}
                className="flex-1 sm:flex-initial px-5 py-2.5 border border-outline-variant rounded-xl font-label-md text-xs sm:text-sm hover:bg-surface-container text-on-surface cursor-pointer font-semibold"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-initial bg-primary text-white font-label-md text-xs sm:text-sm py-2.5 px-8 rounded-xl hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-ambient font-bold cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Our Story
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Shared Confirmation Modal for Removing Section */}
      <ConfirmModal
        isOpen={deleteSectionTarget !== null}
        title="Delete Story Section"
        message={
          deleteSectionTarget !== null && sections[deleteSectionTarget]
            ? `Are you sure you want to remove Section ${deleteSectionTarget + 1} ("${sections[deleteSectionTarget].title || 'Untitled'}")?`
            : 'Are you sure you want to delete this section?'
        }
        confirmText="Remove Section"
        cancelText="Cancel"
        variant="danger"
        icon="delete"
        onConfirm={confirmRemoveSection}
        onClose={() => setDeleteSectionTarget(null)}
      />
    </div>
  );
}
