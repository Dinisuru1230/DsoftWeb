import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function OurStoryManagement() {
  const { token } = useAuth();
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Main Fields
  const [mainTitle, setMainTitle] = useState('About Us');
  const [subtitle, setSubtitle] = useState('');

  // Sections Array: [{ id, title, paragraph }]
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
        setMainTitle(data.mainTitle || 'About Us');
        setSubtitle(data.subtitle || '');

        const loadedSections = (data.sections || []).map((sec, idx) => ({
          id: sec.id || `sec-${idx + 1}-${Date.now()}`,
          title: sec.title || '',
          paragraph: sec.paragraph || '',
        }));
        setSections(loadedSections);
      } else {
        toast.error(data.error || 'Failed to load About Us content.');
      }
    } catch {
      toast.error('Network error loading About Us content.');
    } finally {
      setLoading(false);
    }
  }

  // Add New Section
  function handleAddSection() {
    const nextIdx = sections.length + 1;
    setSections([
      ...sections,
      {
        id: `sec-${nextIdx}-${Date.now()}`,
        title: `New Section ${nextIdx}`,
        paragraph: '',
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

  // Save All Changes
  async function handleSave(e) {
    if (e) e.preventDefault();
    if (!mainTitle.trim()) {
      toast.error('Page Title cannot be empty.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Saving About Us page...');

    try {
      const finalSections = sections.map((sec) => ({
        id: sec.id,
        title: sec.title.trim(),
        paragraph: sec.paragraph.trim(),
      }));

      const res = await fetch(`${API_BASE}/our-story`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainTitle: mainTitle.trim(),
          subtitle: subtitle.trim(),
          sections: finalSections,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('About Us page updated successfully!', { id: toastId });
        fetchStory();
      } else {
        toast.error(data.error || 'Failed to update About Us.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error saving About Us.', { id: toastId });
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
            Edit "About Us" Page
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            Manage company information, vision, and offer details displayed on the About Us page.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/about-us"
            target="_blank"
            className="flex-1 sm:flex-initial p-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2 font-label-md text-xs cursor-pointer shadow-xs font-semibold"
            title="Preview live customer About Us page"
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
          <p className="font-body-md text-sm font-semibold">Loading About Us content...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* ── CARD 1: MAIN HEADER & SUBTITLE ── */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">info</span>
                <div>
                  <h2 className="font-title-sm text-base sm:text-title-sm text-on-surface font-bold">
                    Header &amp; Mission Statement
                  </h2>
                  <p className="font-body-md text-xs text-on-surface-variant">
                    Page headline title and introductory mission paragraph
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-label-md text-xs sm:text-sm text-on-surface mb-1.5 font-bold">
                  Page Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="e.g. About Us"
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body-md text-sm sm:text-base text-on-surface focus:border-primary outline-none transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block font-label-md text-xs sm:text-sm text-on-surface mb-1.5 font-bold">
                  Introduction / Mission Paragraph <span className="text-error">*</span>
                </label>
                <textarea
                  rows={3}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Welcome to DSoft pack. Our mission is to provide top-notch digital products at competitive prices..."
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body-md text-sm text-on-surface focus:border-primary outline-none transition-colors resize-y shadow-inner leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* ── CARD 2: ABOUT US SECTIONS ── */}
          <div className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-3 flex justify-between items-center">
              <div>
                <h2 className="font-headline-md text-lg sm:text-xl text-primary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl">view_agenda</span>
                  About Us Sections ({sections.length})
                </h2>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Manage sections such as "Who We Are", "What We Offer", "Our Commitment", etc.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container text-primary rounded-xl font-label-md text-xs font-bold hover:bg-primary-container/80 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Section
              </button>
            </div>

            {/* List of Section Cards */}
            <div className="space-y-6">
              {sections.map((sec, index) => {
                const secNumber = index + 1;
                return (
                  <div
                    key={sec.id || index}
                    className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-5 relative transition-all"
                  >
                    {/* Section Top Bar: Index & Actions */}
                    <div className="flex items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {secNumber}
                        </span>
                        <h3 className="font-title-sm text-base text-on-surface font-bold">
                          {sec.title || `Section ${secNumber}`}
                        </h3>
                      </div>

                      {/* Reorder and Delete Controls */}
                      <div className="flex items-center gap-1">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSection(index, 'up')}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move section up"
                        >
                          <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={index === sections.length - 1}
                          onClick={() => handleMoveSection(index, 'down')}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move section down"
                        >
                          <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                        </button>

                        {/* Remove Section */}
                        <button
                          type="button"
                          onClick={() => setDeleteSectionTarget(index)}
                          className="p-1.5 text-error hover:bg-error-container/30 rounded-lg cursor-pointer transition-colors"
                          title="Delete section"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Section Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block font-label-sm text-xs text-on-surface-variant mb-1 font-semibold">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                          placeholder="e.g. Who We Are / What We Offer"
                          className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-2.5 font-body-md text-sm text-on-surface focus:border-primary outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-label-sm text-xs text-on-surface-variant mb-1 font-semibold">
                          Section Details / Text
                        </label>
                        <textarea
                          rows={4}
                          value={sec.paragraph}
                          onChange={(e) => handleSectionChange(index, 'paragraph', e.target.value)}
                          placeholder="Enter details for this section..."
                          className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 font-body-md text-sm text-on-surface focus:border-primary outline-none leading-relaxed resize-y"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Save Bar */}
          <div className="sticky bottom-4 z-20 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
              <span className="material-symbols-outlined text-primary text-lg">info</span>
              <span>Changes will immediately reflect on the customer website.</span>
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
                    Save Changes
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
        title="Delete Section"
        message={
          deleteSectionTarget !== null && sections[deleteSectionTarget]
            ? `Are you sure you want to remove Section "${sections[deleteSectionTarget].title || 'Untitled'}"?`
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
