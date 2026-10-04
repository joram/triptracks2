import React, {useCallback, useEffect, useRef, useState} from "react";

const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Lightbox({photos, index, title, onClose, onMove}) {
    const closeRef = useRef();

    useEffect(() => {
        const previouslyFocused = document.activeElement;
        closeRef.current && closeRef.current.focus();
        function onKey(e) {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowRight") onMove(1);
            else if (e.key === "ArrowLeft") onMove(-1);
        }
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
            previouslyFocused && previouslyFocused.focus && previouslyFocused.focus();
        };
    }, [onClose, onMove]);

    return <div className="trail-lightbox" role="dialog" aria-modal="true" aria-label={`${title} photos`} onClick={onClose}>
        <img
            src={photos[index]}
            alt={`${title}, ${index + 1} of ${photos.length}`}
            onClick={(e) => e.stopPropagation()}
        />
        <div className="trail-lightbox-bar" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => onMove(-1)} disabled={index === 0}>Previous</button>
            <span aria-live="polite">{index + 1} of {photos.length}</span>
            <button type="button" onClick={() => onMove(1)} disabled={index === photos.length - 1}>Next</button>
            <button type="button" ref={closeRef} onClick={onClose}>Close</button>
        </div>
    </div>;
}

// A row of photos at a fixed height, each keeping its own aspect ratio, that scrolls
// sideways. Clicking a photo opens it full screen.
export default function PhotoStrip({photos, title}) {
    const [broken, setBroken] = useState(() => new Set());
    const [open, setOpen] = useState(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);
    const trackRef = useRef();

    const visible = photos.filter((p) => !broken.has(p));

    const updateEnds = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        setAtStart(track.scrollLeft <= 4);
        setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
    }, []);

    useEffect(() => {
        updateEnds();
        window.addEventListener("resize", updateEnds);
        return () => window.removeEventListener("resize", updateEnds);
    }, [updateEnds, visible.length]);

    function scrollByPage(direction) {
        const track = trackRef.current;
        track.scrollBy({
            left: direction * track.clientWidth * 0.8,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
    }

    const moveLightbox = useCallback((step) => {
        setOpen((i) => Math.min(Math.max(i + step, 0), visible.length - 1));
    }, [visible.length]);
    const closeLightbox = useCallback(() => setOpen(null), []);

    if (visible.length === 0) {
        return null;
    }

    return <section className="trail-strip" aria-label={`Photos of ${title}`}>
        <div className="trail-strip-track" ref={trackRef} onScroll={updateEnds}>
            {visible.map((src, i) => (
                <button type="button" key={src} className="trail-strip-photo" onClick={() => setOpen(i)}>
                    <img
                        src={src}
                        alt={`${title}, ${i + 1} of ${visible.length}`}
                        loading={i < 3 ? "eager" : "lazy"}
                        onLoad={updateEnds}
                        onError={() => setBroken((prev) => new Set(prev).add(src))}
                    />
                </button>
            ))}
        </div>
        {!(atStart && atEnd) && <div className="trail-strip-nav">
            <button type="button" aria-label="Scroll photos left" onClick={() => scrollByPage(-1)} disabled={atStart}>‹</button>
            <button type="button" aria-label="Scroll photos right" onClick={() => scrollByPage(1)} disabled={atEnd}>›</button>
        </div>}
        {open !== null && <Lightbox
            photos={visible}
            index={open}
            title={title}
            onClose={closeLightbox}
            onMove={moveLightbox}
        />}
    </section>;
}
