// script.js - The Celestial Cartographer's Codex

document.addEventListener('DOMContentLoaded', () => {
    // :::::::::::::: Global State & Selectors ::::::::::::::
    const state = {
        isPreloading: true,
        isCodexOpen: false,
        activeSection: 'genesis', // Default starting section
        mouse: { x: 0, y: 0, isOverInteractive: false },
        scroll: { y: 0, direction: 'down' },
        lastOpenedProjectId: null
    };

    const selectors = {
        preloader: document.getElementById('preloader'),
        preloaderText: document.querySelector('.preloader-text'),
        threeCanvasContainer: document.getElementById('three-canvas-container'),
        siteHeader: document.getElementById('site-header'),
        siteTitle: document.getElementById('site-title'),
        siteTagline: document.getElementById('site-tagline'),
        enterCodexButton: document.getElementById('enter-codex-button'),
        contentCodex: document.getElementById('content-codex'),
        celestialNavigation: document.getElementById('celestial-navigation'),
        navItems: document.querySelectorAll('.nav-item'),
        contentSections: document.querySelectorAll('.content-section'),
        scrollIndicator: document.getElementById('scroll-indicator'),
        portfolioGrid: document.querySelector('.portfolio-grid'),
        projectModal: document.getElementById('project-modal'),
        modalContentWrapper: document.getElementById('modal-content-wrapper'),
        modalTitle: document.getElementById('modal-title'),
        modalBody: document.getElementById('modal-body'),
        modalCloseButton: document.getElementById('modal-close-button'),
        cursorDot: document.getElementById('cursor-dot'),
        cursorAura: document.getElementById('cursor-aura'),
        contactForm: document.getElementById('contact-form')
    };

    // :::::::::::::: Portfolio Project Data (Example) ::::::::::::::
    const portfolioProjects = [
        {
            id: 'project-nova-suite',
            title: 'Nova Suite: Galactic OS Concept',
            category: 'UI/UX Design & Interactive Prototype',
            imageUrl: 'https://images.unsplash.com/photo-1518065950399-63c13ada5574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZ1dHVyaXN0aWMlMjB1aXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=70', // Higher quality placeholder
            description: `<p>Nova Suite is a speculative design for a futuristic operating system, envisioned for deep space explorers and planetary scientists. The interface prioritizes glanceable information, modularity, and resilience in extreme environments.</p><p>Key features include an adaptive 'Starmap Navigator', bio-data integration, and a 'Research Hub' with collaborative tools. The design language blends utilitarian ruggedness with ethereal beauty, drawing inspiration from nebulae and crystalline structures.</p>`,
            technologies: ['Figma', 'Adobe XD', 'JavaScript (for prototype)', 'Lottie Animations', 'UI/UX Research'],
            liveLink: '#', repoLink: '#'
        },
        {
            id: 'project-aether-weaver',
            title: 'AetherWeaver: Generative Art Platform',
            category: 'Web Application & Creative Coding',
            imageUrl: 'https://images.unsplash.com/photo-1620421680784-2cb17e1fda85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWJzdHJhY3QlMjBhcnQlMjBkaWdpdGFsfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=70',
            description: `<p>AetherWeaver is an interactive web application that allows users to create complex generative art by manipulating algorithmic parameters. It utilizes WebGL for real-time rendering and provides a node-based interface for constructing visual 'recipes'.</p><p>The platform encourages experimentation and discovery, offering tools for exporting high-resolution images and animation sequences. A community gallery showcases creations, fostering a collaborative artistic environment.</p>`,
            technologies: ['Three.js', 'React', 'Node.js', 'WebGL Shaders (GLSL)', 'Socket.IO'],
            liveLink: '#', repoLink: '#'
        },
        {
            id: 'project-chronoscape',
            title: 'ChronoScape: Interactive Historical Atlas',
            category: 'Educational Web App & Data Visualization',
            imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d5795c466?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWFydGglMjBmcm9tJTIwc3BhY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=70',
            description: `<p>ChronoScape is a rich interactive web application that visualizes historical events and cultural shifts across a dynamic timeline and global map. Users can explore interconnected data points, filter by regions or themes, and delve into curated narratives.</p><p>The project involved complex data structuring and an intuitive UI to make vast amounts of historical information accessible and engaging. It features custom map projections and animated transitions to illustrate changes over time.</p>`,
            technologies: ['D3.js', 'Vue.js', 'Leaflet.js', 'Python (data processing)', 'PostgreSQL'],
            liveLink: '#', /* No repo for variety */
        },
    ];

    // :::::::::::::: THREE.JS Scene ::::::::::::::
    let scene, camera, renderer, nexusObject, particleSystem;
    const threeJsState = {
        targetRotationX: 0.0005, targetRotationY: 0.0001,
        mouseXMultiplier: 0.00001, mouseYMultiplier: 0.000005,
        cameraZ: 5, fov: 60,
        nexusBaseRotationSpeed: 0.002,
        nexusCurrentRotationSpeed: 0.002,
        particles: { count: 6000, color: 0xffd700, size: 0.012 } // More particles, slightly smaller
    };

    function initThreeScene() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(threeJsState.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = threeJsState.cameraZ;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        selectors.threeCanvasContainer.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Slightly brighter ambient
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Slightly brighter directional
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const nexusGeometry = new THREE.IcosahedronGeometry(1, 2); // Increased detail
        const nexusMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4fcf, // A deeper, slightly different purple
            emissive: 0x1a0f3a, // Subtle emissive for depth
            metalness: 0.7, roughness: 0.2,
            wireframe: true, wireframeLinewidth: 1.5
        });
        nexusObject = new THREE.Mesh(nexusGeometry, nexusMaterial);
        scene.add(nexusObject);

        const particlesGeometry = new THREE.BufferGeometry();
        const particleVertices = [];
        for (let i = 0; i < threeJsState.particles.count; i++) {
            particleVertices.push(
                (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25
            );
        }
        particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particleVertices, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: threeJsState.particles.color, size: threeJsState.particles.size,
            transparent: true, opacity: 0.6, sizeAttenuation: true,
            map: createStarTexture() // Add a subtle texture to particles
        });
        particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
        scene.add(particleSystem);

        animateThreeScene();
    }

    function createStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,220,180,0.8)');
        gradient.addColorStop(0.8, 'rgba(255,215,0,0.2)');
        gradient.addColorStop(1, 'rgba(255,215,0,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        return new THREE.CanvasTexture(canvas);
    }

    function animateThreeScene() {
        requestAnimationFrame(animateThreeScene);
        if (nexusObject) {
            nexusObject.rotation.x += threeJsState.nexusCurrentRotationSpeed;
            nexusObject.rotation.y += threeJsState.nexusCurrentRotationSpeed * 0.7;
        }
        if (particleSystem) particleSystem.rotation.y += 0.00008;

        if (camera) {
            camera.position.x += (state.mouse.x * threeJsState.mouseXMultiplier - camera.position.x) * 0.03;
            camera.position.y += (-state.mouse.y * threeJsState.mouseYMultiplier - camera.position.y) * 0.03;
            camera.lookAt(scene.position);
        }
        renderer.render(scene, camera);
    }

    function onWindowResizeThree() {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    // :::::::::::::: Preloader & Initial Animations ::::::::::::::
    function handlePreloading() {
        const preloaderTexts = [
            "Calibrating Celestial Harmonics...", "Igniting Stellar Cores...",
            "Weaving Digital Constellations...", "Decoding Ancient Algorithms..."
        ];
        let textIndex = 0;
        const textInterval = setInterval(() => {
            textIndex = (textIndex + 1) % preloaderTexts.length;
            selectors.preloaderText.dataset.text = preloaderTexts[textIndex];
        }, 2000);

        setTimeout(() => {
            clearInterval(textInterval);
            selectors.preloader.classList.add('loaded');
            state.isPreloading = false;
            
            // Initial site header animations (staggered)
            anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: selectors.siteHeader,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 1000,
                delay: 500 // After preloader fade
            })
            .add({
                targets: selectors.siteTitle,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 800,
            }, '-=700') // Overlap slightly
            .add({
                targets: selectors.siteTagline,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 800,
            }, '-=600')
            .add({
                targets: selectors.enterCodexButton,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 800,
                complete: () => { // Add pulsing animation after it appears
                    anime({
                        targets: selectors.enterCodexButton,
                        boxShadow: [
                            '0 0 0px var(--color-glow)', // Start with no shadow
                            '0 0 15px var(--color-glow), 0 0 30px var(--color-glow)',
                            '0 0 5px var(--color-glow), 0 0 10px var(--color-glow)'
                        ],
                        loop: true,
                        direction: 'alternate',
                        duration: 2000,
                        easing: 'easeInOutSine'
                    });
                }
            }, '-=500');

        }, 3500); // Reduced preloader time slightly
    }

    // :::::::::::::: Cursor Effects ::::::::::::::
    function initCursorEffects() {
        if (!selectors.cursorDot || !selectors.cursorAura) return;
        window.addEventListener('mousemove', e => {
            state.mouse.x = e.clientX; state.mouse.y = e.clientY;
            anime({ targets: selectors.cursorDot, left: `${state.mouse.x}px`, top: `${state.mouse.y}px`, duration: 50, easing: 'linear' });
            anime({ targets: selectors.cursorAura, left: `${state.mouse.x}px`, top: `${state.mouse.y}px`, duration: 100, easing: 'linear' });
        });
        const interactiveElements = document.querySelectorAll('a, button, .portfolio-item, input, textarea, label');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                selectors.cursorAura.classList.add('interactive'); selectors.cursorDot.classList.add('interactive');
            });
            el.addEventListener('mouseleave', () => {
                selectors.cursorAura.classList.remove('interactive'); selectors.cursorDot.classList.remove('interactive');
            });
        });
        document.addEventListener('mouseleave', () => anime({ targets: [selectors.cursorDot, selectors.cursorAura], opacity: 0, duration: 200 }));
        document.addEventListener('mouseenter', () => {
            anime({ targets: selectors.cursorDot, opacity: 1, duration: 200 });
            anime({ targets: selectors.cursorAura, opacity: 0.3, duration: 200 });
        });
    }
    
    // :::::::::::::: Site Interaction & Navigation ::::::::::::::
    function initSiteInteractions() {
        selectors.enterCodexButton.addEventListener('click', () => {
            if (state.isCodexOpen) return;
            state.isCodexOpen = true;
            anime.remove(selectors.enterCodexButton); // Stop pulsing animation

            // 1. Animate header out
            anime({
                targets: selectors.siteHeader,
                opacity: 0,
                translateY: -100,
                duration: 800,
                easing: 'easeInOutExpo',
                complete: () => selectors.siteHeader.style.display = 'none'
            });

            // 2. Animate Nexus Object
            if (nexusObject) {
                threeJsState.nexusCurrentRotationSpeed = threeJsState.nexusBaseRotationSpeed * 8; // Fast spin
                anime({
                    targets: nexusObject.scale,
                    x: [1, 1.5, 1], y: [1, 1.5, 1], z: [1, 1.5, 1],
                    duration: 1000, easing: 'easeInOutSine',
                    complete: () => {
                        threeJsState.nexusCurrentRotationSpeed = threeJsState.nexusBaseRotationSpeed; // Reset speed
                    }
                });
                if (nexusObject.material.emissive) { // Pulse emissive color
                    const originalEmissiveHex = nexusObject.material.emissive.getHex();
                    nexusObject.material.emissive.setHex(0xffffff);
                    anime({
                        targets: nexusObject.material.emissive,
                        r: (originalEmissiveHex >> 16 & 255) / 255,
                        g: (originalEmissiveHex >> 8 & 255) / 255,
                        b: (originalEmissiveHex & 255) / 255,
                        duration: 1200, delay: 100, easing: 'easeInOutQuad'
                    });
                }
            }
            
            // 3. Reveal Codex Content Container (CSS handles transition via class)
            // Delay this slightly to let header animation start
            setTimeout(() => {
                selectors.contentCodex.classList.add('codex-visible');
            }, 200); // Start codex container reveal slightly after header starts fading

            // 4. Reveal Navigation
            selectors.celestialNavigation.classList.add('nav-visible');
            const navItemAnimTargets = window.innerWidth <= 768 ? 
                                     { translateY: [10, 0] } : 
                                     { translateX: [20, 0] };
            anime({
                targets: '#celestial-navigation .nav-item',
                opacity: [0, 1],
                ...navItemAnimTargets,
                duration: 800,
                delay: anime.stagger(100, { start: 600 }), // Stagger after codex container starts appearing
                easing: 'easeOutExpo'
            });

            // 5. Reveal First Section (Genesis) - timed after codex container animation starts
            setTimeout(() => {
                const genesisSection = document.getElementById('genesis');
                if (genesisSection) {
                    genesisSection.classList.add('is-visible'); // Base visibility for the section

                    const genesisContentWrapper = genesisSection.querySelector('.section-content-wrapper');
                    if (genesisContentWrapper) {
                        anime({ // Special animation for Genesis wrapper
                            targets: genesisContentWrapper,
                            opacity: [0, 1],
                            scale: [0.85, 1],
                            translateY: [20,0],
                            duration: 1000,
                            easing: 'easeOutQuint',
                            // delay: 200 // Delay relative to this timeout
                        });
                    }

                    const ephemeralTexts = genesisSection.querySelectorAll('.ephemeral-text');
                    if (ephemeralTexts.length > 0) {
                        anime({ // Animate Genesis text elements directly
                            targets: ephemeralTexts,
                            translateY: [15, 0],
                            opacity: [0, 1],
                            duration: 800,
                            delay: anime.stagger(150, { start: 300 }), // Start after wrapper animation begins
                            easing: 'easeOutExpo'
                        });
                    }
                }
                updateActiveSection('genesis', true);
                setTimeout(() => selectors.scrollIndicator.classList.add('visible'), 500); // Show scroll indicator after initial content
            }, 800); // This timeout is crucial: after contentCodex transitions are mostly done
        });

        selectors.navItems.forEach(item => {
            item.addEventListener('click', () => scrollToSection(item.dataset.section));
        });

        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            state.scroll.y = window.scrollY;
            state.scroll.direction = state.scroll.y > lastScrollY ? 'down' : 'up';
            lastScrollY = state.scroll.y;

            if (state.isCodexOpen) {
                revealVisibleSections();
                updateActiveNavOnScroll();
                const nearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200;
                if (nearBottom || state.scroll.y < 50) {
                    selectors.scrollIndicator.classList.remove('visible');
                } else {
                    selectors.scrollIndicator.classList.add('visible');
                }
            }
        }, { passive: true });
    }

    function scrollToSection(sectionId) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            const yOffset = (window.innerWidth <= 768) ? -20 : -80; // Less offset on mobile due to bottom nav
            const y = sectionElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            anime({
                targets: document.documentElement, scrollTop: y,
                duration: 1200, easing: 'easeInOutQuint'
            });
            updateActiveSection(sectionId);
        }
    }
    
    function revealVisibleSections() {
        selectors.contentSections.forEach(section => {
            if (section.id === 'genesis' && section.classList.contains('is-visible')) {
                 // Genesis was handled by the initial reveal, skip its standard text animation here
                 // Or ensure its texts are animated only once.
                 // For now, assume its texts animated. Let other sections animate.
            }

            const rect = section.getBoundingClientRect();
            const isVisible = (rect.top <= window.innerHeight * 0.75 && rect.bottom >= window.innerHeight * 0.25);

            if (isVisible && !section.classList.contains('is-visible')) {
                section.classList.add('is-visible');
                // For sections other than Genesis, animate their content wrapper and text
                if (section.id !== 'genesis') {
                     const contentWrapper = section.querySelector('.section-content-wrapper');
                     if(contentWrapper) { // Ensure wrapper animates if not already visible by CSS
                        anime({
                            targets: contentWrapper,
                            opacity: [0, 1],
                            translateY: [20, 0], // Or use its CSS transition via .is-visible
                            duration: 800,
                            easing: 'easeOutExpo',
                            delay: 100
                        });
                     }
                }
                const ephemeralTexts = section.querySelectorAll('.ephemeral-text');
                // Check if these texts haven't been animated by the initial Genesis reveal
                const alreadyAnimatedByGenesis = section.id === 'genesis' && state.isCodexOpen; 
                if (ephemeralTexts.length > 0 && !alreadyAnimatedByGenesis) {
                     // Check a flag or a class if texts are already animated for #genesis
                    if (!ephemeralTexts[0].classList.contains('js-animated')) {
                        anime({
                            targets: ephemeralTexts,
                            translateY: [15, 0],
                            opacity: [0, 1],
                            duration: 800,
                            delay: anime.stagger(150, { start: section.id === 'genesis' ? 0 : 300 }), // No delay for genesis if scrolled back
                            easing: 'easeOutExpo',
                            begin: (anim) => {
                                anim.animatables.forEach(a => a.target.classList.add('js-animated'));
                            }
                        });
                    }
                }
                if (section.id === 'creations') animatePortfolioItems();
            }
        });
    }

    function updateActiveNavOnScroll() {
        let currentSectionId = state.activeSection;
        selectors.contentSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                currentSectionId = section.id;
            }
        });
        if (currentSectionId !== state.activeSection) updateActiveSection(currentSectionId);
    }

    function updateActiveSection(sectionId, force = false) {
        if (!force && sectionId === state.activeSection) return;
        state.activeSection = sectionId;
        selectors.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });
        
        if (nexusObject && nexusObject.material) {
            let newColorHex = 0x5a4fcf; // Default nexus color
            let newEmissiveHex = 0x1a0f3a;
            switch (sectionId) {
                case 'genesis': newColorHex = 0x483d8b; newEmissiveHex = 0x100a28; break;
                case 'creations': newColorHex = 0xff8c00; newEmissiveHex = 0x331c00; break;
                case 'apparatus': newColorHex = 0x20b2aa; newEmissiveHex = 0x062423; break;
                case 'commune': newColorHex = 0xba55d3; newEmissiveHex = 0x260f2a; break;
            }
            if (nexusObject.material.color.getHex() !== newColorHex) {
                 anime({
                    targets: nexusObject.material.color,
                    r: (newColorHex >> 16 & 255) / 255, g: (newColorHex >> 8 & 255) / 255, b: (newColorHex & 255) / 255,
                    duration: 1000, easing: 'easeInOutQuad'
                });
            }
             if (nexusObject.material.emissive && nexusObject.material.emissive.getHex() !== newEmissiveHex) {
                 anime({
                    targets: nexusObject.material.emissive,
                    r: (newEmissiveHex >> 16 & 255) / 255, g: (newEmissiveHex >> 8 & 255) / 255, b: (newEmissiveHex & 255) / 255,
                    duration: 1000, easing: 'easeInOutQuad'
                });
            }
        }
    }

    // :::::::::::::: Portfolio Functionality ::::::::::::::
    function populatePortfolio() {
        if (!selectors.portfolioGrid) return;
        selectors.portfolioGrid.innerHTML = '';
        portfolioProjects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'portfolio-item';
            item.dataset.projectId = project.id;
            item.tabIndex = 0; item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `View details for ${project.title}`);
            item.innerHTML = `
                <div class="portfolio-item-visual"><img src="${project.imageUrl}" alt="${project.title} preview">
                    <div class="portfolio-item-overlay"><h3>${project.title}</h3><p>${project.category}</p></div>
                </div>`;
            item.addEventListener('click', () => openProjectModal(project.id));
            item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openProjectModal(project.id); });
            selectors.portfolioGrid.appendChild(item);
        });
    }

    function animatePortfolioItems() {
        const items = selectors.portfolioGrid.querySelectorAll('.portfolio-item');
        if (items.length > 0 && items[0].style.opacity !== '1') {
            anime({
                targets: items, translateY: [20, 0], scale: [0.95, 1], opacity: [0, 1],
                duration: 800, delay: anime.stagger(100, { grid: [3, Math.ceil(items.length/3)], from: 'center' }),
                easing: 'easeOutExpo'
            });
        }
    }

    function openProjectModal(projectId) {
        const project = portfolioProjects.find(p => p.id === projectId);
        if (!project) return;
        state.lastOpenedProjectId = projectId; // Store for focus return

        selectors.modalTitle.textContent = project.title;
        selectors.modalBody.innerHTML = `
            <img src="${project.imageUrl}" alt="${project.title} full image" class="modal-project-image">
            <div class="project-description">${project.description}</div>
            <div class="project-meta"><h4>Core Technologies & Skills:</h4><ul>${project.technologies.map(tech => `<li>${tech}</li>`).join('')}</ul></div>
            <div class="project-links">
                ${project.liveLink && project.liveLink !== '#' ? `<a href="${project.liveLink}" target="_blank" rel="noopener noreferrer" class="cta-link live">View Live Project</a>` : ''}
                ${project.repoLink && project.repoLink !== '#' ? `<a href="${project.repoLink}" target="_blank" rel="noopener noreferrer" class="cta-link repo">View Repository</a>` : ''}
                ${(!project.liveLink || project.liveLink === '#') && (!project.repoLink || project.repoLink === '#') ? '<p><em>Links for this project are currently unavailable.</em></p>' : ''}
            </div>`;
        selectors.projectModal.classList.add('modal-visible');
        document.body.style.overflow = 'hidden';
        selectors.modalCloseButton.focus();
        // Basic focus trap
        const focusableElements = selectors.modalContentWrapper.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusableElement = focusableElements[0]; const lastFocusableElement = focusableElements[focusableElements.length - 1];
        selectors.projectModal.removeEventListener('keydown', modalKeydownHandler); // Remove old if any
        selectors.projectModal.addEventListener('keydown', modalKeydownHandler);
    }
    
    // Define handler separately to remove it correctly
    function modalKeydownHandler(e) {
        const focusableElements = selectors.modalContentWrapper.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusableElement = focusableElements[0]; const lastFocusableElement = focusableElements[focusableElements.length - 1];
        if (e.key === 'Tab') {
            if (e.shiftKey) { if (document.activeElement === firstFocusableElement) { lastFocusableElement.focus(); e.preventDefault(); }}
            else { if (document.activeElement === lastFocusableElement) { firstFocusableElement.focus(); e.preventDefault(); }}
        }
        if (e.key === 'Escape') closeProjectModal();
    }

    function closeProjectModal() {
        selectors.projectModal.classList.remove('modal-visible');
        document.body.style.overflow = '';
        const openedBy = document.querySelector(`.portfolio-item[data-project-id="${state.lastOpenedProjectId}"]`);
        if (openedBy) openedBy.focus();
        state.lastOpenedProjectId = null;
    }

    selectors.modalCloseButton.addEventListener('click', closeProjectModal);
    selectors.projectModal.addEventListener('click', (e) => { if (e.target === selectors.projectModal) closeProjectModal(); });

    // :::::::::::::: Contact Form ::::::::::::::
    function initContactForm() {
        if (!selectors.contactForm) return;
        selectors.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = selectors.contactForm.querySelector('#name').value;
            const email = selectors.contactForm.querySelector('#email').value;
            const message = selectors.contactForm.querySelector('#message').value;
            if (!name || !email || !message) { alert('Please fill in all fields of the celestial message.'); return; }
            
            const submitButton = selectors.contactForm.querySelector('.transmit-button');
            submitButton.querySelector('.button-text').textContent = 'Transmitting...';
            submitButton.disabled = true;
            anime({ targets: submitButton, scale: [1, 0.9, 1], duration: 500, easing: 'easeInOutSine' });

            setTimeout(() => {
                console.log('Form submitted (simulated):', { name, email, message });
                anime({
                    targets: selectors.contactForm, opacity: [1, 0], translateY: [0, -20], duration: 600, easing: 'easeInExpo',
                    complete: () => {
                        selectors.contactForm.style.display = 'none';
                        const confirmationMessage = document.createElement('p');
                        confirmationMessage.className = 'ephemeral-text js-animated'; // Add js-animated to prevent re-animation
                        confirmationMessage.textContent = 'Your signal has resonated across the void. I shall respond when the celestial alignments are favorable.';
                        Object.assign(confirmationMessage.style, { textAlign: 'center', fontSize: '1.1rem', color: 'var(--color-accent-emerald)' });
                        selectors.contactForm.parentNode.appendChild(confirmationMessage);
                        anime({ targets: confirmationMessage, opacity: [0,1], translateY: [20,0], duration: 800, easing: 'easeOutExpo' });
                    }
                });
            }, 1500);
        });
    }

    // :::::::::::::: Initialization Call ::::::::::::::
    function init() {
        handlePreloading();
        initThreeScene();
        initCursorEffects();
        initSiteInteractions();
        populatePortfolio();
        initContactForm();
        window.addEventListener('resize', onWindowResizeThree);
    }

    init();
});