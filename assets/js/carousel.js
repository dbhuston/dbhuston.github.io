document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('switchTrack');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const carouselViewport = document.querySelector('.carousel-viewport');
    
    if (!track || !carouselViewport) return; // Exit if the gallery isn't on this page

    let isMoving = false;
    let isDragging = false;
    let startX = 0;
    let dragDistance = 0;
    let hasDragged = false;
    const slideDistance = 244; // Tile width (220) + Gap (24)

    // Prevent ghost image dragging on desktop
    const images = document.querySelectorAll('.switch-tile img');
    images.forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    // Helper to get X position for both mouse and touch screens
    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    // --- Button & Wheel Controls ---
    function moveRight() {
        if (isMoving) return;
        isMoving = true;
        track.style.transition = 'transform 0.15s ease-in-out';
        track.style.transform = `translateX(-${slideDistance}px)`;
        setTimeout(() => {
            track.style.transition = 'none';
            track.appendChild(track.children[0]); 
            track.style.transform = 'translateX(0)'; 
            isMoving = false;
        }, 150); 
    }

    function moveLeft() {
        if (isMoving) return;
        isMoving = true;
        track.style.transition = 'none';
        track.prepend(track.children[track.children.length - 1]);
        track.style.transform = `translateX(-${slideDistance}px)`;
        void track.offsetWidth;
        track.style.transition = 'transform 0.15s ease-in-out';
        track.style.transform = 'translateX(0)';
        setTimeout(() => {
            isMoving = false;
        }, 150);
    }

    if (btnNext) btnNext.addEventListener('click', moveRight);
    if (btnPrev) btnPrev.addEventListener('click', moveLeft);

    carouselViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0 || e.deltaX > 0) moveRight();
        else if (e.deltaY < 0 || e.deltaX < 0) moveLeft();
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
        const projectsArticle = document.getElementById('projects');
        if (projectsArticle && projectsArticle.classList.contains('active')) {
            if (e.key === 'ArrowRight') moveRight();
            if (e.key === 'ArrowLeft') moveLeft();
        }
    });

    // --- Continuous 1:1 Dragging ---
    function dragStart(e) {
        if (isMoving) return;
        isDragging = true;
        hasDragged = false;
        startX = getPositionX(e);
        dragDistance = 0;
        track.style.transition = 'none'; 
    }

    function dragMove(e) {
        if (!isDragging) return;
        
        const currentX = getPositionX(e);
        dragDistance = currentX - startX;

        if (Math.abs(dragDistance) > 5) {
            hasDragged = true;
        }

        while (dragDistance <= -slideDistance) {
            track.appendChild(track.children[0]); 
            startX -= slideDistance; 
            dragDistance += slideDistance; 
        } 
        while (dragDistance >= slideDistance) {
            track.prepend(track.children[track.children.length - 1]); 
            startX += slideDistance;
            dragDistance -= slideDistance;
        }

        track.style.transform = `translateX(${dragDistance}px)`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;

        track.style.transition = 'transform 0.15s ease-in-out';

        if (dragDistance < -50) { 
            isMoving = true;
            track.style.transform = `translateX(-${slideDistance}px)`;
            setTimeout(() => {
                track.style.transition = 'none';
                track.appendChild(track.children[0]);
                track.style.transform = 'translateX(0)';
                isMoving = false;
            }, 150);
        } else if (dragDistance > 50) { 
            isMoving = true;
            track.style.transform = `translateX(${slideDistance}px)`;
            setTimeout(() => {
                track.style.transition = 'none';
                track.prepend(track.children[track.children.length - 1]);
                track.style.transform = 'translateX(0)';
                isMoving = false;
            }, 150);
        } else { 
            isMoving = true;
            track.style.transform = 'translateX(0)';
            setTimeout(() => {
                isMoving = false;
            }, 150);
        }
    }

    carouselViewport.addEventListener('mousedown', dragStart);
    carouselViewport.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd); 

    carouselViewport.addEventListener('touchstart', dragStart, { passive: true });
    carouselViewport.addEventListener('touchmove', dragMove, { passive: true });
    
    carouselViewport.addEventListener('click', (e) => {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
    
    window.addEventListener('touchend', dragEnd);
});