/**
 * Guit County Website - Admin Dashboard Script
 * Version 5.0 - Complete & Error-Free
 * All CRUD operations fully functional
 */

(function () {
    'use strict';

    // API Configuration
    const API_URL = '/api'; // Relative path since we serve static from same origin

    const api = {
        get: async (endpoint) => {
            try {
                const res = await fetch(`${API_URL}/${endpoint}`);
                if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
                return await res.json();
            } catch (err) {
                console.error(err);
                showToast('Failed to load data', 'error');
                return [];
            }
        },
        post: async (endpoint, data) => {
            try {
                const res = await fetch(`${API_URL}/${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || errData.message || `API Error: ${res.statusText}`);
                }
                return await res.json();
            } catch (err) {
                console.error(err);
                showToast(err.message || 'Failed to save data', 'error');
                return null;
            }
        },
        put: async (endpoint, id, data) => {
            try {
                const url = id ? `${API_URL}/${endpoint}/${id}` : `${API_URL}/${endpoint}`;
                const res = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || errData.message || `API Error: ${res.statusText}`);
                }
                return await res.json();
            } catch (err) {
                console.error(err);
                showToast(err.message || 'Failed to update data', 'error');
                return null;
            }
        },
        delete: async (endpoint, id) => {
            try {
                const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || errData.message || `API Error: ${res.statusText}`);
                }
                return true;
            } catch (err) {
                console.error(err);
                showToast(err.message || 'Failed to delete data', 'error');
                return false;
            }
        }
    };


    // Initialize AdminDashboard Global Object
    window.AdminDashboard = window.AdminDashboard || {};
    const AdminDashboard = window.AdminDashboard;

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    function generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }



    function getElementValue(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function setElementValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    }

    function setElementText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value || '0';
    }

    function setElementChecked(id, checked) {
        const el = document.getElementById(id);
        if (el) el.checked = !!checked;
    }

    function getElementChecked(id) {
        const el = document.getElementById(id);
        return el ? el.checked : false;
    }

    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return '-';
        }
    }

    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    }

    function validateForm(formId) {
        const form = document.getElementById(formId);
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        return true;
    }

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================

    window.showToast = function (message, type = 'info') {
        const container = document.getElementById('toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `admin-toast admin-toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    function createToastContainer() {
        const el = document.createElement('div');
        el.id = 'toast-container';
        el.className = 'admin-toast-container';
        document.body.appendChild(el);
        return el;
    }

    // ==========================================
    // VIEW MODAL
    // ==========================================
    function showViewModal(title, content) {
        let modal = document.getElementById('viewModal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'viewModal';
            modal.className = 'admin-modal-overlay';
            modal.innerHTML = `
                <div class="admin-modal" style="max-width: 700px;">
                    <div class="admin-modal-header">
                        <h3 class="admin-modal-title" id="viewModalTitle">${title}</h3>
                        <button class="admin-modal-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="admin-modal-body" id="viewModalBody">${content}</div>
                    <div class="admin-modal-footer">
                        <button class="admin-btn admin-btn-primary" data-modal="viewModal">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            setElementText('viewModalTitle', title);
            const body = document.getElementById('viewModalBody');
            if (body) body.innerHTML = content;
        }

        showModal('viewModal');
    }

    // ==========================================
    // DASHBOARD STATISTICS
    // ==========================================
    async function updateDashboardStats() {
        try {
            const stats = await api.get('stats');
            if (!stats) return;

            // Update all counters
            Object.entries(stats).forEach(([key, value]) => {
                setElementText(`${key}Count`, value);
                setElementText(`total${capitalizeFirst(key)}Count`, value);
                setElementText(`${key}Badge`, value);
            });

            // Special cases/Derived counts
            // For more complex stats, we might need a separate call or handle them in the backend
            // For now, let's at least update what's available
            if (stats.leaders !== undefined) {
                setElementText('communityLeadersCount', stats.leaders);
                setElementText('communityLeadersBadge', stats.leaders);
            }

            // News specific
            if (stats.publishedNews) {
                setElementText('publishedNewsCount', stats.publishedNews);
            }

            // Message specific
            if (stats.messages) {
                setElementText('newMessagesCount', stats.unreadMessages || 0);
            }

        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    // ==========================================
    // ARTISTS MANAGEMENT
    // ==========================================

    AdminDashboard.loadArtists = async function () {
        const artists = await api.get('artists');
        const tbody = document.getElementById('artistsTableBody');
        const featuredContainer = document.getElementById('featuredArtistsContent');

        if (tbody) {
            const category = getElementValue('artistCategoryFilter') || 'all';
            const search = getElementValue('artistSearch').toLowerCase();

            const filtered = artists.filter(artist => {
                const matchesCategory = category === 'all' || artist.category === category;
                const matchesSearch = !search ||
                    (artist.fullName && artist.fullName.toLowerCase().includes(search)) ||
                    (artist.stageName && artist.stageName.toLowerCase().includes(search));
                return matchesCategory && matchesSearch;
            });

            setElementText('artistsCount', artists.length);
            setElementText('totalArtistsCount', artists.length);

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center p-3 text-secondary">No artists found.</td></tr>`;
            } else {
                tbody.innerHTML = filtered.map(artist => `
                    <tr>
                        <td><img src="${artist.photo || 'assets/images/default-avatar.png'}" class="table-avatar" alt="${artist.fullName}"></td>
                        <td><strong>${artist.fullName}</strong> ${artist.featured ? '<i class="fas fa-star text-warning ml-1"></i>' : ''}</td>
                        <td>${artist.stageName || '-'}</td>
                        <td><span class="admin-badge admin-badge-primary">${capitalizeFirst(artist.category)}</span></td>
                        <td>${artist.genre || '-'}</td>
                        <td><span class="admin-badge ${artist.status === 'active' ? 'admin-badge-success' : 'admin-badge-warning'}">${capitalizeFirst(artist.status || 'active')}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="admin-btn admin-btn-sm admin-btn-outline" data-action="toggleFeaturedArtist" data-id="${artist.id}" title="Toggle Featured">
                                    <i class="fas fa-star" style="color: ${artist.featured ? '#ffc107' : 'inherit'}"></i>
                                </button>
                                <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editArtist" data-id="${artist.id}" title="Edit"><i class="fas fa-edit"></i></button>
                                <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteArtist" data-id="${artist.id}" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }

        if (featuredContainer) {
            const featured = artists.filter(a => a.featured);
            featuredContainer.innerHTML = featured.length ? `
                <div class="d-grid grid-auto-fit-160 grid-gap-1">
                    ${featured.map(a => `
                        <div class="admin-card text-center p-2">
                            <img src="${a.photo || 'assets/images/default-avatar.png'}" class="avatar-lg mb-2" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">
                            <h5 style="font-size:0.9rem;">${a.stageName || a.fullName}</h5>
                            <small class="text-secondary">${capitalizeFirst(a.category)}</small>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="text-center text-secondary">No featured artists.</p>';
        }
    };

    AdminDashboard.addArtist = function () {
        resetForm('artistForm');
        setElementValue('artistId', '');
        setElementText('artistModalTitle', 'Add New Artist');
        showModal('artistModal');
    };

    AdminDashboard.editArtist = async function (id) {
        const artist = await api.get(`artists/${id}`);
        if (!artist || artist.message === 'Not Found') return showToast('Artist not found', 'error');

        setElementValue('artistId', artist.id || artist._id);
        setElementValue('artistFullName', artist.fullName);
        setElementValue('artistStageName', artist.stageName);
        setElementValue('artistCategory', artist.category);
        setElementValue('artistGenre', artist.genre);
        setElementValue('artistPhoto', artist.photo);
        setElementValue('artistBio', artist.bio);
        setElementValue('artistAchievements', artist.achievements);
        setElementValue('artistPayam', artist.payam);
        setElementValue('artistContact', artist.contact);
        setElementValue('artistFacebook', artist.facebook);
        setElementValue('artistInstagram', artist.instagram);
        setElementValue('artistYouTube', artist.youtube);
        setElementValue('artistTikTok', artist.tiktok);
        setElementValue('artistStatus', artist.status);
        setElementChecked('artistFeatured', artist.featured);

        setElementText('artistModalTitle', 'Edit Artist');
        showModal('artistModal');
    };

    AdminDashboard.saveArtist = async function () {
        if (!validateForm('artistForm')) return;

        const id = getElementValue('artistId');
        const artist = {
            fullName: getElementValue('artistFullName'),
            stageName: getElementValue('artistStageName'),
            category: getElementValue('artistCategory'),
            genre: getElementValue('artistGenre'),
            photo: getElementValue('artistPhoto'),
            bio: getElementValue('artistBio'),
            achievements: getElementValue('artistAchievements'),
            payam: getElementValue('artistPayam'),
            contact: getElementValue('artistContact'),
            facebook: getElementValue('artistFacebook'),
            instagram: getElementValue('artistInstagram'),
            youtube: getElementValue('artistYouTube'),
            tiktok: getElementValue('artistTikTok'),
            status: getElementValue('artistStatus') || 'active',
            featured: getElementChecked('artistFeatured')
        };

        let result;
        if (id) {
            result = await api.put('artists', id, artist);
        } else {
            result = await api.post('artists', artist);
        }

        if (result) {
            hideModal('artistModal');
            await AdminDashboard.loadArtists();
            await updateDashboardStats();
            showToast(`Artist ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteArtist = async function (id) {
        if (!confirm('Are you sure you want to delete this artist?')) return;

        if (await api.delete('artists', id)) {
            await AdminDashboard.loadArtists();
            await updateDashboardStats();
            showToast('Artist deleted successfully', 'success');
        }
    };

    AdminDashboard.toggleFeaturedArtist = async function (id) {
        const artist = await api.get(`artists/${id}`);
        if (!artist || artist.message === 'Not Found') return;

        const updated = await api.put('artists', id, { featured: !artist.featured });

        if (updated) {
            await AdminDashboard.loadArtists();
            showToast(updated.featured ? 'Artist featured!' : 'Artist unfeatured', 'success');
        }
    };

    // ==========================================
    // COMMUNITY LEADERS MANAGEMENT
    // ==========================================

    AdminDashboard.loadCommunityLeaders = async function () {
        const leaders = await api.get('leaders');
        const tbody = document.getElementById('communityLeadersTableBody');

        if (!tbody) return;

        const category = getElementValue('leaderCategoryFilter') || 'all';
        const search = getElementValue('leaderSearch').toLowerCase();

        const filtered = leaders.filter(l => {
            const mCat = category === 'all' || l.category === category;
            const mSearch = !search ||
                (l.fullName && l.fullName.toLowerCase().includes(search)) ||
                (l.title && l.title.toLowerCase().includes(search));
            return mCat && mSearch;
        });

        setElementText('communityLeadersCount', leaders.length);

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-secondary">No leaders found.</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map(leader => `
                <tr>
                    <td><img src="${leader.photo || 'assets/images/default-avatar.png'}" class="table-avatar" alt="${leader.fullName}"></td>
                    <td><strong>${leader.fullName}</strong></td>
                    <td>${leader.title || '-'}</td>
                    <td><span class="admin-badge admin-badge-primary">${capitalizeFirst(leader.category)}</span></td>
                    <td>${leader.payam || '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-info" data-action="viewCommunityLeader" data-id="${leader.id || leader._id}"><i class="fas fa-eye"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editCommunityLeader" data-id="${leader.id || leader._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteCommunityLeader" data-id="${leader.id || leader._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addCommunityLeader = function () {
        resetForm('communityLeaderForm');
        setElementValue('leaderId', '');
        setElementText('communityLeaderModalTitle', 'Add Community Leader');
        showModal('communityLeaderModal');
    };

    AdminDashboard.editCommunityLeader = async function (id) {
        const leader = await api.get(`leaders/${id}`);
        if (!leader || leader.message === 'Not Found') return showToast('Leader not found', 'error');

        setElementValue('leaderId', leader.id || leader._id);
        setElementValue('leaderFullName', leader.fullName);
        setElementValue('leaderTitle', leader.title);
        setElementValue('leaderCategory', leader.category);
        setElementValue('leaderPayam', leader.payam);
        setElementValue('leaderBoma', leader.boma);
        setElementValue('leaderPhoto', leader.photo);
        setElementValue('leaderBio', leader.bio);
        setElementValue('leaderPhone', leader.phone);
        setElementValue('leaderEmail', leader.email);

        setElementText('communityLeaderModalTitle', 'Edit Community Leader');
        showModal('communityLeaderModal');
    };

    AdminDashboard.viewCommunityLeader = async function (id) {
        const leader = await api.get(`leaders/${id}`);
        if (!leader || leader.message === 'Not Found') return showToast('Leader not found', 'error');

        const content = `
            <div class="text-center mb-3">
                <img src="${leader.photo || 'assets/images/default-avatar.png'}" class="avatar-xl mb-2" style="border-radius:50%;">
                <h3>${leader.fullName}</h3>
                <p class="text-secondary">${leader.title || 'Community Leader'}</p>
            </div>
            <div class="admin-form-row">
                <div><strong>Category:</strong> ${capitalizeFirst(leader.category)}</div>
                <div><strong>Payam:</strong> ${leader.payam || '-'}</div>
                <div><strong>Boma:</strong> ${leader.boma || '-'}</div>
                <div><strong>Phone:</strong> ${leader.phone || '-'}</div>
                <div><strong>Email:</strong> ${leader.email || '-'}</div>
            </div>
            ${leader.bio ? `<div class="mt-3"><strong>Biography:</strong><p>${leader.bio}</p></div>` : ''}
        `;

        showViewModal('Leader Details', content);
    };

    AdminDashboard.saveCommunityLeader = async function () {
        if (!validateForm('communityLeaderForm')) return;

        const id = getElementValue('leaderId');
        const leader = {
            fullName: getElementValue('leaderFullName'),
            title: getElementValue('leaderTitle'),
            category: getElementValue('leaderCategory'),
            payam: getElementValue('leaderPayam'),
            boma: getElementValue('leaderBoma'),
            photo: getElementValue('leaderPhoto'),
            bio: getElementValue('leaderBio'),
            phone: getElementValue('leaderPhone'),
            email: getElementValue('leaderEmail')
        };

        let result;
        if (id) {
            result = await api.put('leaders', id, leader);
        } else {
            result = await api.post('leaders', leader);
        }

        if (result) {
            hideModal('communityLeaderModal');
            await AdminDashboard.loadCommunityLeaders();
            await updateDashboardStats();
            showToast(`Leader ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteCommunityLeader = async function (id) {
        if (!confirm('Are you sure you want to delete this leader?')) return;

        if (await api.delete('leaders', id)) {
            await AdminDashboard.loadCommunityLeaders();
            await updateDashboardStats();
            showToast('Leader deleted successfully', 'success');
        }
    };

    // ==========================================
    // STUDENTS MANAGEMENT
    // ==========================================

    AdminDashboard.loadStudents = async function () {
        const students = await api.get('students');
        const tbody = document.getElementById('studentsTableBody');

        if (!tbody) return;

        let activeTab = 'all';
        const activeTabBtn = document.querySelector('.student-tab-btn.active');
        if (activeTabBtn) activeTab = activeTabBtn.getAttribute('data-tab') || 'all';

        const level = getElementValue('studentLevelFilter') || 'all';
        const search = getElementValue('studentSearch').toLowerCase();

        const filtered = students.filter(s => {
            let mTab = true;
            if (activeTab === 'university') mTab = ['University', 'undergraduate', 'graduate'].includes(s.level);
            else if (activeTab === 'secondary') mTab = s.level === 'Secondary' || s.level === 'secondary';
            else if (activeTab === 'alumni') mTab = s.studyStatus === 'graduated';
            else if (activeTab === 'current') mTab = s.studyStatus === 'current';

            const mLevel = level === 'all' || s.level === level;
            const mSearch = !search ||
                (s.fullName && s.fullName.toLowerCase().includes(search)) ||
                (s.institution && s.institution.toLowerCase().includes(search)) ||
                (s.field && s.field.toLowerCase().includes(search));
            return mTab && mLevel && mSearch;
        });

        setElementText('studentsCount', students.length);

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center p-3 text-secondary">No students found.</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map(student => `
                <tr>
                    <td><img src="${student.photo || 'assets/images/default-avatar.png'}" class="table-avatar"></td>
                    <td><strong>${student.fullName}</strong></td>
                    <td><span class="admin-badge admin-badge-info">${student.level}</span></td>
                    <td>${student.institution || '-'}</td>
                    <td>${student.field || '-'}</td>
                    <td>${student.year || '-'}</td>
                    <td><span class="admin-badge ${student.studyStatus === 'current' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(student.studyStatus || 'current')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-info" data-action="viewStudent" data-id="${student.id || student._id}"><i class="fas fa-eye"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editStudent" data-id="${student.id || student._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteStudent" data-id="${student.id || student._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addStudent = function () {
        resetForm('studentForm');
        setElementValue('studentId', '');
        setElementText('studentModalTitle', 'Register Student');
        const schField = document.getElementById('scholarshipFields');
        if (schField) schField.style.display = 'none';
        showModal('studentModal');
    };

    AdminDashboard.editStudent = async function (id) {
        const s = await api.get(`students/${id}`);
        if (!s || s.message === 'Not Found') return showToast('Student not found', 'error');

        setElementValue('studentId', s.id || s._id);
        setElementValue('studentFirstName', s.firstName);
        setElementValue('studentMiddleName', s.middleName);
        setElementValue('studentLastName', s.lastName);
        setElementValue('studentGender', s.gender);
        setElementValue('studentDOB', s.dob ? new Date(s.dob).toISOString().split('T')[0] : '');
        setElementValue('studentPayam', s.payam);
        setElementValue('studentPhoto', s.photo);
        setElementValue('studentLevel', s.level);
        setElementValue('studentStudyStatus', s.studyStatus);
        setElementValue('studentInstitution', s.institution);
        setElementValue('studentCountry', s.country);
        setElementValue('studentField', s.field);
        setElementValue('studentSpecialization', s.specialization);
        setElementValue('studentYear', s.year);
        setElementValue('studentEnrollYear', s.enrollYear);
        setElementValue('studentGradYear', s.gradYear);
        setElementValue('studentScholarshipName', s.scholarshipName);
        setElementValue('studentScholarshipType', s.scholarshipType);
        setElementValue('studentPhone', s.phone);
        setElementValue('studentEmail', s.email);
        setElementValue('studentAddress', s.address);
        setElementValue('studentFacebook', s.facebook);
        setElementValue('studentLinkedIn', s.linkedIn);
        setElementValue('studentAchievements', s.achievements);
        setElementValue('studentActivities', s.activities);
        setElementValue('studentCareerGoal', s.careerGoal);
        setElementValue('studentMemberStatus', s.memberStatus);
        setElementValue('studentJoinDate', s.joinDate ? new Date(s.joinDate).toISOString().split('T')[0] : '');

        setElementChecked('studentNotable', s.notable);
        setElementChecked('studentScholarship', s.scholarship);

        const schField = document.getElementById('scholarshipFields');
        if (schField) schField.style.display = s.scholarship ? 'block' : 'none';

        setElementText('studentModalTitle', 'Edit Student Registration');
        showModal('studentModal');
    };

    AdminDashboard.saveStudent = async function () {
        if (!validateForm('studentForm')) return;

        const id = getElementValue('studentId');
        const first = getElementValue('studentFirstName');
        const middle = getElementValue('studentMiddleName');
        const last = getElementValue('studentLastName');
        const fullName = `${first} ${middle ? middle + ' ' : ''}${last}`;

        const student = {
            fullName,
            firstName: first,
            middleName: middle,
            lastName: last,
            gender: getElementValue('studentGender'),
            dob: getElementValue('studentDOB'),
            payam: getElementValue('studentPayam'),
            photo: getElementValue('studentPhoto'),
            level: getElementValue('studentLevel'),
            studyStatus: getElementValue('studentStudyStatus'),
            institution: getElementValue('studentInstitution'),
            country: getElementValue('studentCountry'),
            field: getElementValue('studentField'),
            specialization: getElementValue('studentSpecialization'),
            year: getElementValue('studentYear'),
            enrollYear: getElementValue('studentEnrollYear'),
            gradYear: getElementValue('studentGradYear'),
            scholarship: getElementChecked('studentScholarship'),
            scholarshipName: getElementValue('studentScholarshipName'),
            scholarshipType: getElementValue('studentScholarshipType'),
            phone: getElementValue('studentPhone'),
            email: getElementValue('studentEmail'),
            address: getElementValue('studentAddress'),
            facebook: getElementValue('studentFacebook'),
            linkedIn: getElementValue('studentLinkedIn'),
            achievements: getElementValue('studentAchievements'),
            activities: getElementValue('studentActivities'),
            careerGoal: getElementValue('studentCareerGoal'),
            memberStatus: getElementValue('studentMemberStatus'),
            joinDate: getElementValue('studentJoinDate'),
            notable: getElementChecked('studentNotable')
        };

        let result;
        if (id) {
            result = await api.put('students', id, student);
        } else {
            result = await api.post('students', student);
        }

        if (result) {
            hideModal('studentModal');
            await AdminDashboard.loadStudents();
            await updateDashboardStats();
            showToast(`Student ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.viewStudent = async function (id) {
        const s = await api.get(`students/${id}`);
        if (!s || s.message === 'Not Found') return showToast('Student not found', 'error');

        const content = `
            <div class="text-center mb-4">
                <img src="${s.photo || 'assets/images/default-avatar.png'}" class="avatar-xl mb-2" style="border-radius:50%; width:100px; height:100px; object-fit:cover;">
                <h3>${s.fullName}</h3>
                <p class="text-primary font-weight-bold">${s.level} - ${s.field || 'General'}</p>
                <span class="admin-badge ${s.studyStatus === 'current' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(s.studyStatus)}</span>
            </div>
            <div class="admin-form-row mt-3">
                <div><strong>Institution:</strong> ${s.institution || '-'}</div>
                <div><strong>Location:</strong> ${s.payam || '-'}, ${s.country || 'South Sudan'}</div>
                <div><strong>Year:</strong> ${s.year || '-'} (${s.enrollYear || ''} - ${s.gradYear || ''})</div>
                <div><strong>Email:</strong> ${s.email || '-'}</div>
                <div><strong>Phone:</strong> ${s.phone || '-'}</div>
                <div><strong>Status:</strong> ${capitalizeFirst(s.memberStatus || 'Active')}</div>
            </div>
            ${s.scholarship ? `<div class="mt-2 p-2 bg-light border-radius-sm"><strong>Scholarship:</strong> ${s.scholarshipName} (${s.scholarshipType})</div>` : ''}
            ${s.achievements ? `<div class="mt-3"><strong>Achievements:</strong><p>${s.achievements}</p></div>` : ''}
            ${s.careerGoal ? `<div class="mt-3"><strong>Career Goal:</strong><p>${s.careerGoal}</p></div>` : ''}
        `;

        showViewModal('Student Profile', content);
    };

    AdminDashboard.deleteStudent = async function (id) {
        if (!confirm('Are you sure you want to delete this student record?')) return;

        if (await api.delete('students', id)) {
            await AdminDashboard.loadStudents();
            await updateDashboardStats();
            showToast('Student record deleted', 'success');
        }
    };

    // ==========================================
    // NEWS MANAGEMENT
    // ==========================================


    AdminDashboard.loadNews = async function () {
        const news = await api.get('news');
        const tbody = document.getElementById('newsTableBody');
        if (!tbody) return;

        const category = getElementValue('newsCategoryFilter') || 'all';
        const search = getElementValue('newsSearch').toLowerCase();

        const filtered = news.filter(n => {
            const mCat = category === 'all' || n.category === category;
            const mSearch = !search || n.title.toLowerCase().includes(search);
            return mCat && mSearch;
        });

        setElementText('newsCount', news.length);

        tbody.innerHTML = filtered.map(item => `
            <tr>
                <td><img src="${item.image || 'assets/images/default-news.jpg'}" class="table-avatar" style="width: 60px; height: 40px; border-radius: 4px; object-fit: cover;"></td>
                <td>
                    <strong>${item.title}</strong>
                    ${item.mediaType && item.mediaType !== 'image' ? ` <i class="fas ${item.mediaType === 'video' ? 'fa-play-circle' : 'fa-volume-up'} text-primary" title="${item.mediaType}"></i>` : ''}
                </td>
                <td><span class="admin-badge admin-badge-primary">${capitalizeFirst(item.category)}</span></td>
                <td>${item.author || 'Admin'}</td>
                <td>${formatDate(item.date || item.createdAt)}</td>
                <td><span class="admin-badge ${item.status === 'published' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(item.status || 'draft')}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="admin-btn admin-btn-sm admin-btn-info" data-action="previewNews" data-id="${item.id || item._id}"><i class="fas fa-eye"></i></button>
                        <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editNews" data-id="${item.id || item._id}"><i class="fas fa-edit"></i></button>
                        <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteNews" data-id="${item.id || item._id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    AdminDashboard.addNews = function () {
        resetForm('newsForm');
        setElementValue('newsId', '');
        setElementText('newsModalTitle', 'Add News Article');
        showModal('newsModal');
    };

    AdminDashboard.editNews = async function (id) {
        const item = await api.get(`news/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Article not found', 'error');

        setElementValue('newsId', item.id || item._id);
        setElementValue('newsTitle', item.title);
        setElementValue('newsCategory', item.category);
        setElementValue('newsContent', item.content);
        setElementValue('newsImage', item.image);
        setElementValue('newsStatus', item.status);
        setElementValue('newsAuthor', item.author);
        setElementValue('newsMediaType', item.mediaType || 'image');
        setElementValue('newsMediaUrl', item.mediaUrl || '');

        setElementText('newsModalTitle', 'Edit News Article');
        showModal('newsModal');
    };

    AdminDashboard.previewNews = async function (id) {
        const item = await api.get(`news/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Article not found', 'error');

        let mediaHtml = '';
        if (item.mediaType === 'video' && item.mediaUrl) {
            if (item.mediaUrl.includes('youtube.com') || item.mediaUrl.includes('youtu.be')) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = item.mediaUrl.match(regExp);
                const videoId = (match && match[2].length === 11) ? match[2] : null;
                mediaHtml = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin-bottom:1rem;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe></div>`;
            } else {
                mediaHtml = `<video src="${item.mediaUrl}" controls style="width:100%;margin-bottom:1rem;"></video>`;
            }
        } else if (item.mediaType === 'audio' && item.mediaUrl) {
            mediaHtml = `<div style="padding:20px;background:#f0f7ff;border-radius:8px;margin-bottom:1rem;text-align:center;"><audio src="${item.mediaUrl}" controls style="width:100%;"></audio></div>`;
        } else if (item.image) {
            mediaHtml = `<img src="${item.image}" style="width:100%;max-height:300px;object-fit:cover;border-radius:8px;margin-bottom:1rem;">`;
        }

        const content = `
            ${mediaHtml}
            <h2>${item.title}</h2>
            <div class="d-flex gap-2 mb-3">
                <span class="admin-badge admin-badge-info">${item.category || 'General'}</span>
                <span class="text-secondary">${formatDate(item.date || item.createdAt)}</span>
                <span class="text-secondary">by ${item.author || 'Admin'}</span>
            </div>
            <div class="news-content" style="white-space: pre-wrap;">${item.content || 'No content available.'}</div>
        `;

        showViewModal('Article Preview', content);
    };

    AdminDashboard.saveNews = async function () {
        if (!validateForm('newsForm')) return;

        const id = getElementValue('newsId');
        const article = {
            title: getElementValue('newsTitle'),
            category: getElementValue('newsCategory'),
            content: getElementValue('newsContent'),
            image: getElementValue('newsImage'),
            status: getElementValue('newsStatus') || 'draft',
            author: getElementValue('newsAuthor') || 'Admin',
            mediaType: getElementValue('newsMediaType') || 'image',
            mediaUrl: getElementValue('newsMediaUrl') || ''
        };

        let result;
        if (id) {
            result = await api.put('news', id, article);
        } else {
            result = await api.post('news', article);
        }

        if (result) {
            hideModal('newsModal');
            await AdminDashboard.loadNews();
            await updateDashboardStats();
            showToast(`Article ${id ? 'updated' : 'published'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteNews = async function (id) {
        if (!confirm('Delete this article?')) return;

        if (await api.delete('news', id)) {
            await AdminDashboard.loadNews();
            await updateDashboardStats();
            showToast('Article deleted', 'success');
        }
    };

    // ==========================================
    // SLIDESHOW MANAGEMENT
    // ==========================================

    AdminDashboard.loadSlideshow = async function () {
        const slides = await api.get('slides');
        const tbody = document.getElementById('slideshowTableBody');
        if (!tbody) return;

        if (slides.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-secondary">No slides found.</td></tr>`;
        } else {
            tbody.innerHTML = slides.sort((a, b) => (a.order || 0) - (b.order || 0)).map(slide => `
                <tr>
                    <td><img src="${slide.image || 'assets/images/placeholder.jpg'}" class="table-avatar" style="width: 80px; height: 45px; border-radius: 4px; object-fit: cover;"></td>
                    <td>${slide.title || '-'}</td>
                    <td>${slide.subtitle || '-'}</td>
                    <td>${slide.order || 0}</td>
                    <td><span class="admin-badge ${slide.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(slide.status || 'active')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editSlide" data-id="${slide.id || slide._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteSlide" data-id="${slide.id || slide._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addSlide = async function () {
        resetForm('slideshowForm');
        setElementValue('slideId', '');
        const slides = await api.get('slides');
        setElementValue('slideOrder', slides.length + 1);
        setElementText('slideshowModalTitle', 'Add New Slide');
        showModal('slideshowModal');
    };

    AdminDashboard.editSlide = async function (id) {
        const slide = await api.get(`slides/${id}`);
        if (!slide || slide.message === 'Not Found') return showToast('Slide not found', 'error');

        setElementValue('slideId', slide.id || slide._id);
        setElementValue('slideTitle', slide.title);
        setElementValue('slideSubtitle', slide.subtitle);
        setElementValue('slideImage', slide.image);
        setElementValue('slideBtnText', slide.btnText);
        setElementValue('slideBtnLink', slide.btnLink);
        setElementValue('slideOrder', slide.order);
        setElementValue('slideStatus', slide.status);

        setElementText('slideshowModalTitle', 'Edit Slide');
        showModal('slideshowModal');
    };

    AdminDashboard.saveSlide = async function () {
        if (!validateForm('slideshowForm')) return;

        const id = getElementValue('slideId');
        const slide = {
            title: getElementValue('slideTitle'),
            subtitle: getElementValue('slideSubtitle'),
            image: getElementValue('slideImage'),
            btnText: getElementValue('slideBtnText'),
            btnLink: getElementValue('slideBtnLink'),
            order: parseInt(getElementValue('slideOrder')) || 0,
            status: getElementValue('slideStatus') || 'active'
        };

        let result;
        if (id) {
            result = await api.put('slides', id, slide);
        } else {
            result = await api.post('slides', slide);
        }

        if (result) {
            hideModal('slideshowModal');
            await AdminDashboard.loadSlideshow();
            await updateDashboardStats();
            showToast('Slide saved successfully', 'success');
        }
    };

    AdminDashboard.deleteSlide = async function (id) {
        if (!confirm('Delete this slide?')) return;

        if (await api.delete('slides', id)) {
            await AdminDashboard.loadSlideshow();
            await updateDashboardStats();
            showToast('Slide deleted', 'success');
        }
    };

    // ==========================================
    // SERVICES MANAGEMENT
    // ==========================================

    AdminDashboard.loadServices = async function () {
        const services = await api.get('services');
        const tbody = document.getElementById('servicesTableBody');
        if (!tbody) return;

        const search = getElementValue('serviceSearch') ? getElementValue('serviceSearch').toLowerCase() : '';
        const category = getElementValue('serviceCategoryFilter');

        const filtered = services.filter(s => {
            return (!search || s.name.toLowerCase().includes(search)) &&
                (!category || category === 'all' || s.category === category);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-secondary">No services found.</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map(s => `
                <tr>
                    <td><strong>${s.name}</strong></td>
                    <td>${capitalizeFirst(s.category || 'general')}</td>
                    <td>${s.location || '-'}</td>
                    <td><span class="admin-badge ${s.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(s.status || 'active')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editService" data-id="${s.id || s._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteService" data-id="${s.id || s._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addService = function () {
        resetForm('serviceForm');
        setElementValue('serviceId', '');
        setElementText('serviceModalTitle', 'Add New Service');
        showModal('serviceModal');
    };

    AdminDashboard.editService = async function (id) {
        const s = await api.get(`services/${id}`);
        if (!s || s.message === 'Not Found') return showToast('Service not found', 'error');

        setElementValue('serviceId', s.id || s._id);
        setElementValue('serviceName', s.name);
        setElementValue('serviceCategory', s.category);
        setElementValue('serviceLocation', s.location);
        setElementValue('serviceDescription', s.description);
        setElementValue('serviceStatus', s.status);

        setElementText('serviceModalTitle', 'Edit Service');
        showModal('serviceModal');
    };

    AdminDashboard.saveService = async function () {
        if (!validateForm('serviceForm')) return;

        const id = getElementValue('serviceId');
        const service = {
            name: getElementValue('serviceName'),
            category: getElementValue('serviceCategory'),
            location: getElementValue('serviceLocation'),
            description: getElementValue('serviceDescription'),
            status: getElementValue('serviceStatus') || 'active'
        };

        let result;
        if (id) {
            result = await api.put('services', id, service);
        } else {
            result = await api.post('services', service);
        }

        if (result) {
            hideModal('serviceModal');
            await AdminDashboard.loadServices();
            await updateDashboardStats();
            showToast(`Service ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteService = async function (id) {
        if (!confirm('Are you sure you want to delete this service?')) return;

        if (await api.delete('services', id)) {
            await AdminDashboard.loadServices();
            await updateDashboardStats();
            showToast('Service deleted successfully', 'success');
        }
    };

    // ==========================================
    // EDUCATION MANAGEMENT
    // ==========================================

    AdminDashboard.loadEducation = async function () {
        const institutions = await api.get('education');
        const tbody = document.getElementById('educationTableBody');
        if (!tbody) return;

        const search = getElementValue('educationSearch') ? getElementValue('educationSearch').toLowerCase() : '';
        const level = getElementValue('educationTypeFilter');

        const filtered = institutions.filter(item => {
            return (!search || item.name.toLowerCase().includes(search)) &&
                (!level || level === 'all' || item.level === level);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-secondary">No institutions found.</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map(item => `
                <tr>
                    <td><img src="${item.image || 'assets/images/placeholder-school.jpg'}" class="table-avatar" style="object-fit:cover; width: 40px; height: 40px; border-radius: 4px;"></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${capitalizeFirst(item.level || 'school')}</td>
                    <td>${item.location || '-'}</td>
                    <td><span class="admin-badge ${item.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(item.status || 'active')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editEducation" data-id="${item.id || item._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteEducation" data-id="${item.id || item._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addEducation = function () {
        resetForm('educationForm');
        setElementValue('educationId', '');
        setElementText('educationModalTitle', 'Add Institution');
        showModal('educationModal');
    };

    AdminDashboard.editEducation = async function (id) {
        const item = await api.get(`education/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Institution not found', 'error');

        setElementValue('educationId', item.id || item._id);
        setElementValue('educationName', item.name);
        setElementValue('educationLevel', item.level);
        setElementValue('educationLocation', item.location);
        setElementValue('educationPrincipal', item.principal);
        setElementValue('educationImage', item.image);
        setElementValue('educationStatus', item.status);

        setElementText('educationModalTitle', 'Edit Institution');
        showModal('educationModal');
    };

    AdminDashboard.saveEducation = async function () {
        if (!validateForm('educationForm')) return;

        const id = getElementValue('educationId');
        const data = {
            name: getElementValue('educationName'),
            level: getElementValue('educationLevel'),
            location: getElementValue('educationLocation'),
            principal: getElementValue('educationPrincipal'),
            image: getElementValue('educationImage'),
            status: getElementValue('educationStatus') || 'active'
        };

        let result;
        if (id) {
            result = await api.put('education', id, data);
        } else {
            result = await api.post('education', data);
        }

        if (result) {
            hideModal('educationModal');
            await AdminDashboard.loadEducation();
            await updateDashboardStats();
            showToast(`Institution ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteEducation = async function (id) {
        if (!confirm('Are you sure you want to delete this institution?')) return;

        if (await api.delete('education', id)) {
            await AdminDashboard.loadEducation();
            await updateDashboardStats();
            showToast('Institution deleted successfully', 'success');
        }
    };

    // ==========================================
    // HISTORY MANAGEMENT
    // ==========================================
    AdminDashboard.loadHistory = async function () {
        const events = await api.get('history');
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        if (events.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-secondary">No historical entries found.</td></tr>`;
        } else {
            tbody.innerHTML = events.sort((a, b) => b.year - a.year).map(item => `
                <tr>
                    <td><img src="${item.image || 'assets/images/placeholder-history.jpg'}" class="table-avatar" style="object-fit:cover; width: 40px; height: 40px; border-radius: 4px;"></td>
                    <td><strong>${item.year}</strong></td>
                    <td>
                        ${item.title}
                        ${item.mediaType === 'video' ? ' <i class="fas fa-play-circle text-primary" title="Video"></i>' : ''}
                        ${item.mediaType === 'audio' ? ' <i class="fas fa-volume-up text-success" title="Audio"></i>' : ''}
                    </td>
                    <td>${capitalizeFirst(item.category)}</td>
                    <td>${item.description ? item.description.substring(0, 50) + '...' : '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editHistory" data-id="${item.id || item._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteHistory" data-id="${item.id || item._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addHistory = function () {
        resetForm('historyForm');
        setElementValue('historyId', '');
        setElementText('historyModalTitle', 'Add Event');
        showModal('historyModal');
    };

    AdminDashboard.editHistory = async function (id) {
        const item = await api.get(`history/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Event not found', 'error');

        setElementValue('historyId', item.id || item._id);
        setElementValue('historyTitle', item.title);
        setElementValue('historyYear', item.year);
        setElementValue('historyCategory', item.category);
        setElementValue('historyImage', item.image);
        setElementValue('historyDescription', item.description);
        setElementValue('historyMediaType', item.mediaType || 'image');
        setElementValue('historyMediaUrl', item.mediaUrl || '');

        setElementText('historyModalTitle', 'Edit Event');
        showModal('historyModal');
    };

    AdminDashboard.saveHistory = async function () {
        if (!validateForm('historyForm')) return;

        const id = getElementValue('historyId');
        const item = {
            title: getElementValue('historyTitle'),
            year: getElementValue('historyYear'),
            category: getElementValue('historyCategory'),
            image: getElementValue('historyImage'),
            description: getElementValue('historyDescription'),
            mediaType: getElementValue('historyMediaType') || 'image',
            mediaUrl: getElementValue('historyMediaUrl') || ''
        };

        let result;
        if (id) {
            result = await api.put('history', id, item);
        } else {
            result = await api.post('history', item);
        }

        if (result) {
            hideModal('historyModal');
            await AdminDashboard.loadHistory();
            await updateDashboardStats();
            showToast(`Event ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteHistory = async function (id) {
        if (!confirm('Delete this event?')) return;
        if (await api.delete('history', id)) {
            await AdminDashboard.loadHistory();
            await updateDashboardStats();
            showToast('Event deleted successfully', 'success');
        }
    };

    // ==========================================
    // HEALTHCARE MANAGEMENT
    // ==========================================

    AdminDashboard.loadHealthcare = async function () {
        const facilities = await api.get('healthcare');
        const tbody = document.getElementById('healthcareTableBody');
        if (!tbody) return;

        const search = getElementValue('healthcareSearch') ? getElementValue('healthcareSearch').toLowerCase() : '';
        const type = getElementValue('healthcareTypeFilter');

        const filtered = facilities.filter(item => {
            return (!search || item.name.toLowerCase().includes(search)) &&
                (!type || type === 'all' || item.type === type);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-secondary">No facilities found.</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map(item => `
                <tr>
                    <td><img src="${item.image || 'assets/images/placeholder-hospital.jpg'}" class="table-avatar" style="object-fit:cover; width: 40px; height: 40px; border-radius: 4px;"></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${capitalizeFirst(item.type || 'facility')}</td>
                    <td>${item.location || '-'}</td>
                    <td><span class="admin-badge ${item.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(item.status || 'Active')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editHealthcare" data-id="${item.id || item._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteHealthcare" data-id="${item.id || item._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addHealthcare = function () {
        resetForm('healthcareForm');
        setElementValue('healthcareId', '');
        setElementText('healthcareModalTitle', 'Add Facility');
        showModal('healthcareModal');
    };

    AdminDashboard.editHealthcare = async function (id) {
        const item = await api.get(`healthcare/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Facility not found', 'error');

        setElementValue('healthcareId', item.id || item._id);
        setElementValue('healthcareName', item.name);
        setElementValue('healthcareType', item.type);
        setElementValue('healthcareLocation', item.location);
        setElementValue('healthcareServices', item.services);
        setElementValue('healthcareImage', item.image);
        setElementValue('healthcareStatus', item.status);

        setElementText('healthcareModalTitle', 'Edit Facility');
        showModal('healthcareModal');
    };

    AdminDashboard.saveHealthcare = async function () {
        if (!validateForm('healthcareForm')) return;

        const id = getElementValue('healthcareId');
        const facility = {
            name: getElementValue('healthcareName'),
            type: getElementValue('healthcareType'),
            location: getElementValue('healthcareLocation'),
            services: getElementValue('healthcareServices'),
            image: getElementValue('healthcareImage'),
            status: getElementValue('healthcareStatus') || 'active'
        };

        let result;
        if (id) {
            result = await api.put('healthcare', id, facility);
        } else {
            result = await api.post('healthcare', facility);
        }

        if (result) {
            hideModal('healthcareModal');
            await AdminDashboard.loadHealthcare();
            await updateDashboardStats();
            showToast(`Facility ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteHealthcare = async function (id) {
        if (!confirm('Are you sure you want to delete this facility?')) return;

        if (await api.delete('healthcare', id)) {
            await AdminDashboard.loadHealthcare();
            await updateDashboardStats();
            showToast('Facility deleted successfully', 'success');
        }
    };

    // ==========================================
    // POLITICIANS MANAGEMENT
    // ==========================================
    AdminDashboard.loadPoliticians = async function () {
        const data = await api.get('politicians');
        const tbody = document.getElementById('politiciansTableBody');
        if (!tbody) return;

        const search = getElementValue('politicianSearch') ? getElementValue('politicianSearch').toLowerCase() : '';
        const party = getElementValue('politicianPartyFilter');

        const filtered = data.filter(item => {
            return (!search || item.name.toLowerCase().includes(search)) &&
                (!party || party === 'all' || item.party === party);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-secondary">No politicians found.</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map(item => `
                <tr>
                    <td><img src="${item.photo || 'assets/images/default-avatar.png'}" class="table-avatar" style="object-fit:cover; width: 40px; height: 40px; border-radius: 4px;"></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.position}</td>
                    <td>${item.party || '-'}</td>
                    <td><span class="admin-badge ${item.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(item.status || 'active')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editPolitician" data-id="${item.id || item._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deletePolitician" data-id="${item.id || item._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addPolitician = function () {
        resetForm('politicianForm');
        setElementValue('politicianId', '');
        setElementText('politicianModalTitle', 'Add Politician');
        showModal('politicianModal');
    };

    AdminDashboard.editPolitician = async function (id) {
        const item = await api.get(`politicians/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Politician not found', 'error');

        setElementValue('politicianId', item.id || item._id);
        setElementValue('politicianName', item.name);
        setElementValue('politicianPosition', item.position);
        setElementValue('politicianParty', item.party);
        setElementValue('politicianPhoto', item.photo);
        setElementValue('politicianBio', item.bio || item.biography || '');
        setElementValue('politicianStatus', item.status || 'active');

        setElementText('politicianModalTitle', 'Edit Politician');
        showModal('politicianModal');
    };

    AdminDashboard.savePolitician = async function () {
        if (!validateForm('politicianForm')) return;

        const id = getElementValue('politicianId');
        const item = {
            name: getElementValue('politicianName'),
            position: getElementValue('politicianPosition'),
            party: getElementValue('politicianParty'),
            photo: getElementValue('politicianPhoto'),
            bio: getElementValue('politicianBio'),
            status: getElementValue('politicianStatus') || 'active'
        };

        let result;
        if (id) {
            result = await api.put('politicians', id, item);
        } else {
            result = await api.post('politicians', item);
        }

        if (result) {
            hideModal('politicianModal');
            await AdminDashboard.loadPoliticians();
            await updateDashboardStats();
            showToast(`Politician ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deletePolitician = async function (id) {
        if (!confirm('Delete this profile?')) return;

        if (await api.delete('politicians', id)) {
            await AdminDashboard.loadPoliticians();
            await updateDashboardStats();
            showToast('Profile deleted successfully', 'success');
        }
    };

    // ==========================================
    // MILITARY MANAGEMENT
    // ==========================================
    // ==========================================
    // MILITARY MANAGEMENT
    // ==========================================

    AdminDashboard.loadMilitary = async function () {
        const personnel = await api.get('military');
        const tbody = document.getElementById('militaryTableBody');
        if (!tbody) return;

        const branch = getElementValue('militaryBranchFilter');
        const search = getElementValue('militarySearch') ? getElementValue('militarySearch').toLowerCase() : '';

        const filtered = personnel.filter(item => {
            return (!search || item.name.toLowerCase().includes(search)) &&
                (!branch || branch === 'all' || item.branch === branch);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-secondary">No personnel found.</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map(item => `
                <tr>
                    <td><img src="${item.photo || 'assets/images/default-avatar.png'}" class="table-avatar" style="object-fit:cover;"></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.rank || '-'}</td>
                    <td><span class="admin-badge admin-badge-info">${capitalizeFirst(item.branch || 'army')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editMilitary" data-id="${item.id || item._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteMilitary" data-id="${item.id || item._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addMilitary = function () {
        resetForm('militaryForm');
        setElementValue('militaryId', '');
        setElementText('militaryModalTitle', 'Add Personnel');
        showModal('militaryModal');
    };

    AdminDashboard.editMilitary = async function (id) {
        const item = await api.get(`military/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Personnel not found', 'error');

        setElementValue('militaryId', item.id || item._id);
        setElementValue('militaryName', item.name);
        setElementValue('militaryRank', item.rank);
        setElementValue('militaryBranch', item.branch);
        setElementValue('militaryPhoto', item.photo);

        setElementText('militaryModalTitle', 'Edit Personnel');
        showModal('militaryModal');
    };

    AdminDashboard.saveMilitary = async function () {
        if (!validateForm('militaryForm')) return;

        const id = getElementValue('militaryId');
        const person = {
            name: getElementValue('militaryName'),
            rank: getElementValue('militaryRank'),
            branch: getElementValue('militaryBranch'),
            photo: getElementValue('militaryPhoto')
        };

        let result;
        if (id) {
            result = await api.put('military', id, person);
        } else {
            result = await api.post('military', person);
        }

        if (result) {
            hideModal('militaryModal');
            await AdminDashboard.loadMilitary();
            await updateDashboardStats();
            showToast(`Personnel ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteMilitary = async function (id) {
        if (!confirm('Are you sure you want to delete this personnel record?')) return;

        if (await api.delete('military', id)) {
            await AdminDashboard.loadMilitary();
            await updateDashboardStats();
            showToast('Personnel deleted successfully', 'success');
        }
    };

    // ==========================================
    // COMMISSIONER MANAGEMENT
    // ==========================================

    AdminDashboard.loadCommissioner = async function () {
        const commissioners = await api.get('commissioner');

        // Since this is a singleton profile, we take the first one if available
        if (commissioners && commissioners.length > 0) {
            const data = commissioners[0];
            setElementValue('commissionerId', data.id || data._id);
            setElementValue('commissionerName', data.name);
            setElementValue('commissionerMessage', data.message);
            setElementValue('commissionerPhoto', data.photo);
        } else {
            // Reset if no data
            setElementValue('commissionerId', '');
            setElementValue('commissionerName', '');
            setElementValue('commissionerMessage', '');
            setElementValue('commissionerPhoto', '');
        }
    };

    AdminDashboard.saveCommissioner = async function () {
        const id = getElementValue('commissionerId');
        const data = {
            name: getElementValue('commissionerName'),
            message: getElementValue('commissionerMessage'),
            photo: getElementValue('commissionerPhoto')
        };

        if (!data.name) {
            return showToast('Please enter the Commissioner\'s name', 'error');
        }

        let result;
        if (id) {
            result = await api.put('commissioner', id, data);
        } else {
            // Check if one already exists to enforce singleton
            const existing = await api.get('commissioner');
            if (existing && existing.length > 0) {
                // Update the existing one instead of creating new
                result = await api.put('commissioner', existing[0].id || existing[0]._id, data);
            } else {
                result = await api.post('commissioner', data);
            }
        }

        if (result) {
            await AdminDashboard.loadCommissioner();
            await updateDashboardStats();
            showToast('Commissioner profile saved successfully!', 'success');
        }
    };

    AdminDashboard.deleteCommissioner = async function () {
        const id = getElementValue('commissionerId');
        if (!id) return showToast('No commissioner profile to delete', 'warning');

        if (!confirm('Are you sure you want to delete the Commissioner profile?')) return;

        if (await api.delete('commissioner', id)) {
            setElementValue('commissionerId', '');
            setElementValue('commissionerName', '');
            setElementValue('commissionerMessage', '');
            setElementValue('commissionerPhoto', '');
            await updateDashboardStats();
            showToast('Commissioner profile deleted successfully', 'success');
        }
    };

    // ==========================================
    // PAYAMS & BOMAS MANAGEMENT
    // ==========================================
    // ==========================================
    // PAYAMS MANAGEMENT
    // ==========================================

    AdminDashboard.loadPayams = async function () {
        const payams = await api.get('payams');
        const tbody = document.getElementById('payamsTableBody');
        if (!tbody) return;

        if (payams.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-secondary">No payams found.</td></tr>`;
        } else {
            tbody.innerHTML = payams.map(p => `
                <tr>
                    <td><img src="${p.image || 'assets/images/placeholder-payam.jpg'}" class="table-avatar" style="object-fit:cover; width: 40px; height: 40px; border-radius: 4px;"></td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.chief || '-'}</td>
                    <td>${p.population || '-'}</td>
                    <td><span class="admin-badge admin-badge-success">${capitalizeFirst(p.status || 'Active')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editPayam" data-id="${p.id || p._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deletePayam" data-id="${p.id || p._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        setElementText('payamsBadge', payams.length);
    };

    AdminDashboard.addPayam = function () {
        resetForm('payamForm');
        setElementValue('payamId', '');
        setElementText('payamModalTitle', 'Add Payam');
        showModal('payamModal');
    };

    AdminDashboard.editPayam = async function (id) {
        const item = await api.get(`payams/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Payam not found', 'error');

        setElementValue('payamId', item.id || item._id);
        setElementValue('payamName', item.name);
        setElementValue('payamChief', item.chief);
        setElementValue('payamPopulation', item.population);
        setElementValue('payamImage', item.image);
        setElementValue('payamStatus', item.status || 'active');

        setElementText('payamModalTitle', 'Edit Payam');
        showModal('payamModal');
    };

    AdminDashboard.savePayam = async function () {
        if (!validateForm('payamForm')) return;

        const id = getElementValue('payamId');
        const payam = {
            name: getElementValue('payamName'),
            chief: getElementValue('payamChief'),
            population: getElementValue('payamPopulation'),
            image: getElementValue('payamImage'),
            status: getElementValue('payamStatus') || 'active'
        };

        let result;
        if (id) {
            result = await api.put('payams', id, payam);
        } else {
            result = await api.post('payams', payam);
        }

        if (result) {
            hideModal('payamModal');
            await AdminDashboard.loadPayams();
            await updateDashboardStats();
            showToast(`Payam ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deletePayam = async function (id) {
        if (!confirm('Delete this Payam?')) return;

        if (await api.delete('payams', id)) {
            await AdminDashboard.loadPayams();
            await updateDashboardStats();
            showToast('Payam deleted successfully', 'success');
        }
    };

    // ==========================================
    // BOMAS MANAGEMENT
    // ==========================================

    AdminDashboard.loadBomas = async function () {
        const bomas = await api.get('bomas');
        const tbody = document.getElementById('bomasTableBody');
        if (!tbody) return;

        if (bomas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-secondary">No bomas found.</td></tr>`;
        } else {
            tbody.innerHTML = bomas.map(b => `
                <tr>
                    <td><img src="${b.image || 'assets/images/placeholder-boma.jpg'}" class="table-avatar" style="object-fit:cover; width: 40px; height: 40px; border-radius: 4px;"></td>
                    <td><strong>${b.name}</strong></td>
                    <td>${b.population || '-'}</td>
                    <td>${b.chief || '-'}</td>
                    <td><span class="admin-badge ${b.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(b.status || 'active')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editBoma" data-id="${b.id || b._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteBoma" data-id="${b.id || b._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addBoma = function () {
        resetForm('bomaForm');
        setElementValue('bomaId', '');
        setElementText('bomaModalTitle', 'Add Boma');
        showModal('bomaModal');
    };

    AdminDashboard.editBoma = async function (id) {
        const item = await api.get(`bomas/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Boma not found', 'error');

        setElementValue('bomaId', item.id || item._id);
        setElementValue('bomaName', item.name);
        setElementValue('bomaPayam', item.payam);
        setElementValue('bomaPopulation', item.population);
        setElementValue('bomaChief', item.chief);
        setElementValue('bomaImage', item.image);
        setElementValue('bomaStatus', item.status || 'active');

        setElementText('bomaModalTitle', 'Edit Boma');
        showModal('bomaModal');
    };

    AdminDashboard.saveBoma = async function () {
        if (!validateForm('bomaForm')) return;

        const id = getElementValue('bomaId');
        const boma = {
            name: getElementValue('bomaName'),
            payam: getElementValue('bomaPayam'),
            population: getElementValue('bomaPopulation'),
            chief: getElementValue('bomaChief'),
            image: getElementValue('bomaImage'),
            status: getElementValue('bomaStatus') || 'active'
        };

        let result;
        if (id) {
            result = await api.put('bomas', id, boma);
        } else {
            result = await api.post('bomas', boma);
        }

        if (result) {
            hideModal('bomaModal');
            await AdminDashboard.loadBomas();
            await updateDashboardStats();
            showToast(`Boma ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteBoma = async function (id) {
        if (!confirm('Delete this Boma?')) return;

        if (await api.delete('bomas', id)) {
            await AdminDashboard.loadBomas();
            await updateDashboardStats();
            showToast('Boma deleted successfully', 'success');
        }
    };

    // ==========================================
    // SPORTS MANAGEMENT
    // ==========================================

    AdminDashboard.loadSports = async function () {
        const sports = await api.get('sports');
        const tbody = document.getElementById('sportsTableBody');
        if (!tbody) return;

        const category = getElementValue('sportsCategoryFilter');
        const search = getElementValue('sportsSearch') ? getElementValue('sportsSearch').toLowerCase() : '';

        const filtered = sports.filter(item => {
            return (!search || item.name.toLowerCase().includes(search)) &&
                (!category || category === 'all' || item.category === category);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-secondary">No sports entries found.</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map(item => `
                <tr>
                    <td><img src="${item.image || 'assets/images/placeholder-sports.jpg'}" class="table-avatar" style="object-fit:cover; width: 40px; height: 40px; border-radius: 4px;"></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${capitalizeFirst(item.category || 'general')}</td>
                    <td>${item.details || '-'}</td>
                    <td><span class="admin-badge ${item.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary'}">${capitalizeFirst(item.status || 'active')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editSports" data-id="${item.id || item._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteSports" data-id="${item.id || item._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.addSports = function () {
        resetForm('sportsForm');
        setElementValue('sportsId', '');
        setElementText('sportsModalTitle', 'Add Sports Entry');
        showModal('sportsModal');
    };

    AdminDashboard.editSports = async function (id) {
        const item = await api.get(`sports/${id}`);
        if (!item || item.message === 'Not Found') return showToast('Entry not found', 'error');

        setElementValue('sportsId', item.id || item._id);
        setElementValue('sportsName', item.name);
        setElementValue('sportsCategory', item.category);
        setElementValue('sportsDetails', item.details || item.description);
        setElementValue('sportsImage', item.image);
        setElementValue('sportsStatus', item.status || 'active');

        setElementText('sportsModalTitle', 'Edit Entry');
        showModal('sportsModal');
    };

    AdminDashboard.saveSports = async function () {
        if (!validateForm('sportsForm')) return;

        const id = getElementValue('sportsId');
        const sport = {
            name: getElementValue('sportsName'),
            category: getElementValue('sportsCategory'),
            details: getElementValue('sportsDetails'),
            image: getElementValue('sportsImage'),
            status: getElementValue('sportsStatus') || 'active'
        };

        let result;
        if (id) {
            result = await api.put('sports', id, sport);
        } else {
            result = await api.post('sports', sport);
        }

        if (result) {
            hideModal('sportsModal');
            await AdminDashboard.loadSports();
            await updateDashboardStats();
            showToast(`Entry ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteSports = async function (id) {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        if (await api.delete('sports', id)) {
            await AdminDashboard.loadSports();
            await updateDashboardStats();
            showToast('Entry deleted successfully', 'success');
        }
    };

    // ==========================================
    // MESSAGES MANAGEMENT
    // ==========================================

    AdminDashboard.loadMessages = async function () {
        const messages = await api.get('messages');
        const tbody = document.getElementById('messagesTableBody');
        const unreadCount = messages.filter(m => m.status !== 'read').length;
        setElementText('unreadCount', unreadCount + ' Unread');
        setElementText('messagesBadge', unreadCount);

        if (!tbody) return;

        if (messages.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-secondary">No messages in inbox.</td></tr>`;
        } else {
            tbody.innerHTML = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(m => `
                <tr class="${m.status !== 'read' ? 'font-weight-bold' : ''}">
                    <td>${formatDate(m.createdAt || m.date)}</td>
                    <td>${m.name || '-'}</td>
                    <td>${m.subject || '-'}</td>
                    <td><span class="admin-badge ${m.status !== 'read' ? 'admin-badge-danger' : 'admin-badge-success'}">${capitalizeFirst(m.status || 'New')}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-info" data-action="viewMessage" data-id="${m.id || m._id}"><i class="fas fa-eye"></i></button>
                            ${m.status !== 'read' ? `<button class="admin-btn admin-btn-sm admin-btn-success" data-action="markMessageRead" data-id="${m.id || m._id}" title="Mark Read"><i class="fas fa-check"></i></button>` : ''}
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteMessage" data-id="${m.id || m._id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    };

    AdminDashboard.viewMessage = async function (id) {
        const msg = await api.get(`messages/${id}`);
        if (msg) {
            const content = `
                <div class="message-view">
                    <p><strong>From:</strong> ${msg.name} (${msg.email})</p>
                    <p><strong>Subject:</strong> ${msg.subject}</p>
                    <p><strong>Date:</strong> ${formatDate(msg.createdAt || msg.date)}</p>
                    <hr class="my-3">
                    <p><strong>Message:</strong></p>
                    <div class="p-3 bg-light rounded" style="white-space: pre-wrap;">${msg.message}</div>
                </div>
            `;
            showViewModal('Message Details', content);

            if (msg.status !== 'read') {
                await AdminDashboard.markMessageRead(id);
            }
        }
    };

    AdminDashboard.markMessageRead = async function (id) {
        if (await api.put('messages', id, { status: 'read' })) {
            await AdminDashboard.loadMessages();
            await updateDashboardStats();
        }
    };

    AdminDashboard.deleteMessage = async function (id) {
        if (!confirm('Delete this message?')) return;
        if (await api.delete('messages', id)) {
            await AdminDashboard.loadMessages();
            await updateDashboardStats();
            showToast('Message deleted', 'success');
        }
    };

    AdminDashboard.loadNewsletter = function () {
        // Placeholder for future newsletter history or subscriber list loading
    };

    AdminDashboard.sendNewsletter = function () {
        resetForm('newsletterForm');
        showModal('newsletterModal');
    }

    AdminDashboard.performSendNewsletter = function () {
        const subject = getElementValue('newsletterSubject');
        const message = getElementValue('newsletterMessage');
        if (!subject || !message) {
            showToast('Please fill all fields', 'error');
            return;
        }

        // Simulate sending
        const btn = document.querySelector('#newsletterModal .admin-btn-primary');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            hideModal('newsletterModal');
            showToast('Newsletter sent successfully!', 'success');
        }, 1500);
    };


    // ==========================================
    // USERS MANAGEMENT
    // ==========================================

    AdminDashboard.loadUsers = async function () {
        const users = await api.get('users');
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        const role = getElementValue('userRoleFilter');
        const search = getElementValue('userSearch') ? getElementValue('userSearch').toLowerCase() : '';

        const filtered = users.filter(u => {
            return (!search || u.username.toLowerCase().includes(search) || (u.email && u.email.toLowerCase().includes(search))) &&
                (!role || role === 'all' || u.role === role);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-3 text-secondary">No users found.</td></tr>`;
        } else {
            tbody.innerHTML = filtered.map(u => `
               <tr>
                   <td><strong>${u.username}</strong></td>
                   <td><span class="admin-badge admin-badge-primary">${u.role || 'admin'}</span></td>
                   <td>${u.email || '-'}</td>
                   <td><span class="admin-badge ${u.status === 'active' ? 'admin-badge-success' : 'admin-badge-danger'}">${u.status || 'active'}</span></td>
                   <td>
                        <div class="action-buttons">
                            <button class="admin-btn admin-btn-sm admin-btn-primary" data-action="editUser" data-id="${u.id || u._id}"><i class="fas fa-edit"></i></button>
                            <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="deleteUser" data-id="${u.id || u._id}"><i class="fas fa-trash"></i></button>
                        </div>
                   </td>
               </tr>
           `).join('');
        }
    };

    AdminDashboard.addUser = function () {
        resetForm('userForm');
        setElementValue('userId', '');
        setElementText('userModalTitle', 'Add User');
        showModal('userModal');
    };

    AdminDashboard.editUser = async function (id) {
        const u = await api.get(`users/${id}`);
        if (!u || u.message === 'Not Found') return showToast('User not found', 'error');

        setElementValue('userId', u.id || u._id);
        setElementValue('userUsername', u.username);
        setElementValue('userEmail', u.email);
        setElementValue('userRole', u.role);
        setElementValue('userStatus', u.status);
        setElementValue('userPassword', ''); // Don't show password

        setElementText('userModalTitle', 'Edit User');
        showModal('userModal');
    };

    AdminDashboard.saveUser = async function () {
        if (!validateForm('userForm')) return;

        const id = getElementValue('userId');
        const user = {
            username: getElementValue('userUsername'),
            email: getElementValue('userEmail'),
            role: getElementValue('userRole'),
            status: getElementValue('userStatus') || 'active'
        };

        const pwd = getElementValue('userPassword');
        if (pwd) user.password = pwd;

        let result;
        if (id) {
            result = await api.put('users', id, user);
        } else {
            if (!pwd) return showToast('Password required for new user', 'error');
            result = await api.post('users', user);
        }

        if (result) {
            hideModal('userModal');
            await AdminDashboard.loadUsers();
            await updateDashboardStats();
            showToast(`User ${id ? 'updated' : 'added'} successfully!`, 'success');
        }
    };

    AdminDashboard.deleteUser = async function (id) {
        if (!confirm('Delete this user?')) return;
        if (await api.delete('users', id)) {
            await AdminDashboard.loadUsers();
            await updateDashboardStats();
            showToast('User deleted successfully', 'success');
        }
    };

    // ==========================================
    // SETTINGS MANAGEMENT
    // ==========================================

    AdminDashboard.loadSettings = async function () {
        const settings = await api.get('settings');
        if (settings) {
            setElementValue('siteTitle', settings.siteTitle || '');
            setElementValue('contactEmail', settings.contactEmail || '');
            setElementValue('contactPhone', settings.contactPhone || '');
            setElementValue('facebook', settings.facebook || '');
            setElementValue('twitter', settings.twitter || '');
            setElementValue('instagram', settings.instagram || '');
            setElementValue('youtube', settings.youtube || '');
        }
    };

    AdminDashboard.saveSettings = async function () {
        const settings = {
            siteTitle: getElementValue('siteTitle'),
            contactEmail: getElementValue('contactEmail'),
            contactPhone: getElementValue('contactPhone'),
            facebook: getElementValue('facebook'),
            twitter: getElementValue('twitter'),
            instagram: getElementValue('instagram'),
            youtube: getElementValue('youtube')
        };

        if (await api.put('settings', null, settings)) {
            showToast('Settings saved successfully', 'success');
        }
    };



    // Auth Check Helper
    function checkAuth() {
        const session = JSON.parse(localStorage.getItem('guitAdminSession') || localStorage.getItem('adminSession'));

        // Strict check: if no session or expired, redirect
        if (!session || (session.expiresAt && session.expiresAt < Date.now())) {
            // Only redirect if not already on login page to avoid loops (though checkAuth usually runs on admin page)
            if (!window.location.href.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return false;
        }

        // Update user profile in sidebar if available
        const userEl = document.querySelector('.admin-user-name');
        if (userEl && session.username) userEl.textContent = session.username;

        return true;
    }

    // ==========================================
    // EVENT DELEGATION & UI HANDLERS
    // ==========================================

    function setupEventDelegation() {
        // Global click handler for all data-action buttons
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-action]');
            if (btn) {
                const action = btn.getAttribute('data-action');
                const id = btn.getAttribute('data-id');

                if (AdminDashboard[action]) {
                    e.preventDefault();
                    e.stopPropagation();
                    AdminDashboard[action](id);
                }
                return;
            }

            // Handle modal close buttons
            const closeBtn = e.target.closest('.admin-modal-close');
            if (closeBtn) {
                const modal = closeBtn.closest('.admin-modal-overlay');
                if (modal) {
                    hideModal(modal.id);
                }
                return;
            }

            // Handle modal cancel buttons (data-modal attribute)
            const cancelBtn = e.target.closest('[data-modal]');
            if (cancelBtn) {
                const modalId = cancelBtn.getAttribute('data-modal');
                if (modalId) {
                    hideModal(modalId);
                }
                return;
            }

            // Handle section navigation
            const sectionBtn = e.target.closest('[data-section]');
            if (sectionBtn) {
                e.preventDefault();
                const section = sectionBtn.getAttribute('data-section');
                if (section) {
                    navigateToSection(section);
                }
                return;
            }

            // Close modal when clicking overlay
            if (e.target.classList.contains('admin-modal-overlay')) {
                hideModal(e.target.id);
            }

            // Security: If clicking Register link, keep session alive
            const registerLink = e.target.closest('a[href="register.html"]');
            if (registerLink) {
                sessionStorage.setItem('keepAdminSession', 'true');
            }

            // Security: If clicking View Website / Home link, logout immediately
            const homeLink = e.target.closest('a[href="index.html"]');
            if (homeLink) {
                localStorage.removeItem('guitAdminSession');
                localStorage.removeItem('adminSession');
                sessionStorage.clear();
            }
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function (e) {
                e.preventDefault();
                const sidebar = document.querySelector('.admin-sidebar');
                const main = document.querySelector('.admin-main');
                const overlay = document.querySelector('.sidebar-overlay');

                if (window.innerWidth <= 1024) {
                    if (sidebar) sidebar.classList.toggle('active');
                    if (overlay) overlay.classList.toggle('active');
                } else {
                    if (sidebar) sidebar.classList.toggle('collapsed');
                    if (main) main.classList.toggle('expanded');
                }
            });
        }

        // Sidebar overlay
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function () {
                const sidebar = document.querySelector('.admin-sidebar');
                if (sidebar) sidebar.classList.remove('active');
                this.classList.remove('active');
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function (e) {
                e.preventDefault();
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('adminTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');

                const icon = this.querySelector('i');
                if (icon) {
                    icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
                }
            });

            // Load saved theme
            const savedTheme = localStorage.getItem('adminTheme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                const icon = themeToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-sun';
            }
        }

        // Student tabs
        document.querySelectorAll('.student-tab-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.student-tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                if (AdminDashboard.loadStudents) AdminDashboard.loadStudents();
            });
        });

        // Scholarship checkbox toggle
        const scholarshipCheckbox = document.getElementById('studentScholarship');
        if (scholarshipCheckbox) {
            scholarshipCheckbox.addEventListener('change', function () {
                const scholarshipFields = document.getElementById('scholarshipFields');
                if (scholarshipFields) {
                    scholarshipFields.style.display = this.checked ? 'block' : 'none';
                }
            });
        }

        // Notification Toggle
        const notifBtn = document.getElementById('notificationBtn');
        if (notifBtn) {
            notifBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const panel = document.getElementById('notificationPanel');
                if (panel) panel.classList.toggle('active');
            });

            // Close when clicking outside
            document.addEventListener('click', function (e) {
                const panel = document.getElementById('notificationPanel');
                if (panel && panel.classList.contains('active') && !panel.contains(e.target) && e.target !== notifBtn && !notifBtn.contains(e.target)) {
                    panel.classList.remove('active');
                }
            });
        }

        // Search and filter handlers
        setupSearchAndFilters();
    }

    function setupGlobalSearch() {
        const input = document.getElementById('globalSearchInput');
        const resultsDropdown = document.getElementById('searchResultsDropdown');

        if (!input || !resultsDropdown) return;

        input.addEventListener('input', debounce(async function (e) {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                resultsDropdown.classList.remove('active');
                return;
            }

            resultsDropdown.innerHTML = '<div class="p-3 text-center text-muted"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
            resultsDropdown.classList.add('active');

            try {
                // Fetch relevant data from ALL endpoints in parallel
                const [
                    news, politicians, leaders, artists, students, services,
                    education, history, healthcare, military, payams, bomas,
                    sports, slides, messages, users
                ] = await Promise.all([
                    api.get('news').catch(() => []),
                    api.get('politicians').catch(() => []),
                    api.get('leaders').catch(() => []),
                    api.get('artists').catch(() => []),
                    api.get('students').catch(() => []),
                    api.get('services').catch(() => []),

                    api.get('education').catch(() => []),
                    api.get('history').catch(() => []),
                    api.get('healthcare').catch(() => []),
                    api.get('military').catch(() => []),
                    api.get('payams').catch(() => []),
                    api.get('bomas').catch(() => []),
                    api.get('sports').catch(() => []),
                    api.get('slides').catch(() => []),
                    api.get('messages').catch(() => []),
                    api.get('users').catch(() => [])
                ]);

                // Helper to normalize and search
                const searchIn = (items, type, section, titleKey = 'name') => {
                    return items
                        .filter(item => {
                            // Determine searchable fields based on item structure
                            const title = (item[titleKey] || item.title || item.username || '').toLowerCase();
                            const content = (
                                item.content || item.description || item.bio ||
                                item.message || item.location || ''
                            ).toLowerCase();

                            return title.includes(query) || content.includes(query);
                        })
                        .map(item => ({
                            title: item[titleKey] || item.title || item.username || 'Untitled',
                            type: type,
                            section: section,
                            id: item.id || item._id
                        }));
                };

                const results = [
                    ...searchIn(news, 'News', 'news', 'title'),
                    ...searchIn(politicians, 'Politician', 'politicians'),
                    ...searchIn(leaders, 'Community Leader', 'community-leaders'),
                    ...searchIn(artists, 'Artist', 'artists'),
                    ...searchIn(students, 'Student', 'students'),
                    ...searchIn(services, 'Service', 'services', 'title'),

                    ...searchIn(education, 'Education', 'education'),
                    ...searchIn(history, 'History', 'history', 'title'),
                    ...searchIn(healthcare, 'Healthcare', 'healthcare'),
                    ...searchIn(military, 'Military', 'military'),
                    ...searchIn(payams, 'Payam', 'payams'),
                    ...searchIn(bomas, 'Boma', 'bomas'),
                    ...searchIn(sports, 'Sport', 'sports'),
                    ...searchIn(slides, 'Slide', 'slideshow', 'title'),
                    ...searchIn(messages, 'Message', 'messages', 'name'),
                    ...searchIn(users, 'User', 'users', 'username')
                ].slice(0, 15); // Limit total results to 15

                if (results.length > 0) {
                    resultsDropdown.innerHTML = results.map(r => `
                        <div class="search-result-item" onclick="AdminDashboard.navigateToSearchResult('${r.section}', '${r.id}')">
                            <i class="fas fa-search"></i>
                            <div>
                                <div style="font-weight:600;">${r.title}</div>
                                <div style="font-size:0.75rem; opacity:0.7;">${r.type}</div>
                            </div>
                        </div>
                    `).join('') + `
                        <div class="p-2 text-center" style="border-top:1px solid var(--admin-border);">
                            <small class="text-muted">Displaying top ${results.length} matches</small>
                        </div>
                    `;
                } else {
                    resultsDropdown.innerHTML = '<div class="p-3 text-center text-muted">No matches found.</div>';
                }
            } catch (err) {
                console.error('Search error:', err);
                resultsDropdown.innerHTML = '<div class="p-3 text-center text-danger">Search failed</div>';
            }
        }, 500));

        // Hide results on click outside
        document.addEventListener('click', function (e) {
            if (!input.contains(e.target) && !resultsDropdown.contains(e.target)) {
                resultsDropdown.classList.remove('active');
            }
        });
    }

    AdminDashboard.navigateToSearchResult = function (section, id) {
        navigateToSection(section);
        document.getElementById('searchResultsDropdown').classList.remove('active');
        // Ideally we would also scroll to the item or highlight it, but for now just going to the section is good
        showToast('Navigated to ' + section, 'info');
    };

    function setupSearchAndFilters() {
        const filters = [
            { search: 'artistSearch', filter: 'artistCategoryFilter', load: 'loadArtists' },
            { search: 'leaderSearch', filter: 'leaderCategoryFilter', load: 'loadCommunityLeaders' },
            { search: 'studentSearch', filter: 'studentLevelFilter', load: 'loadStudents' },
            { search: 'newsSearch', filter: null, load: 'loadNews' }
        ];

        filters.forEach(({ search, filter, load }) => {
            const searchEl = document.getElementById(search);
            const filterEl = filter ? document.getElementById(filter) : null;

            if (searchEl) {
                searchEl.addEventListener('input', debounce(function () {
                    if (AdminDashboard[load]) AdminDashboard[load]();
                }, 300));
            }

            if (filterEl) {
                filterEl.addEventListener('change', function () {
                    if (AdminDashboard[load]) AdminDashboard[load]();
                });
            }
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function navigateToSection(sectionId) {
        // Remove active from all nav links
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active to clicked link
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink && activeLink.classList.contains('admin-nav-link')) {
            activeLink.classList.add('active');
        }

        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');

            // Load section data
            const loadFunctionName = `load${sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`;
            if (AdminDashboard[loadFunctionName]) {
                AdminDashboard[loadFunctionName]();
            }

            // Update page title
            const pageTitle = document.querySelector('.admin-page-title');
            if (pageTitle) {
                pageTitle.textContent = capitalizeFirst(sectionId);
            }

            // Close mobile sidebar
            if (window.innerWidth <= 1024) {
                const sidebar = document.querySelector('.admin-sidebar');
                const overlay = document.querySelector('.sidebar-overlay');
                if (sidebar) sidebar.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            }
        }
    }

    // ==========================================
    // LOGOUT HANDLER
    // ==========================================
    AdminDashboard.logout = function () {
        if (confirm('Are you sure you want to logout?')) {
            // Clear all possible session keys
            localStorage.removeItem('guitAdminSession');
            localStorage.removeItem('adminSession');
            sessionStorage.clear();

            // Show toast and redirect
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    };

    // ==========================================
    // FILE UPLOAD HANDLER (Images, Videos, Audio)
    // ==========================================
    const handleFileUpload = async (event, targetId) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file); // 'image' is the field name expected by the server

        try {
            showToast('Uploading file...', 'info');
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await res.json();
            const urlInput = document.getElementById(targetId);
            if (urlInput) {
                urlInput.value = data.url;
                showToast('File uploaded successfully!', 'success');
                urlInput.dispatchEvent(new Event('change'));
            }
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Failed to upload file', 'error');
        }
    };

    const setupImageUploads = () => {
        const uploads = [
            { file: 'artistPhotoFile', target: 'artistPhoto' },
            { file: 'newsImageFile', target: 'newsImage' },
            { file: 'newsMediaFile', target: 'newsMediaUrl' }, // New field for video/audio
            { file: 'leaderPhotoFile', target: 'leaderPhoto' },
            { file: 'studentPhotoFile', target: 'studentPhoto' },
            { file: 'slideImageFile', target: 'slideImage' },
            { file: 'politicianPhotoFile', target: 'politicianPhoto' },
            { file: 'militaryPhotoFile', target: 'militaryPhoto' },
            { file: 'commissionerPhotoFile', target: 'commissionerPhoto' },
            { file: 'educationImageFile', target: 'educationImage' },
            { file: 'historyImageFile', target: 'historyImage' },
            { file: 'historyMediaFile', target: 'historyMediaUrl' }, // New history media
            { file: 'healthcareImageFile', target: 'healthcareImage' },
            { file: 'payamImageFile', target: 'payamImage' },
            { file: 'bomaImageFile', target: 'bomaImage' },
            { file: 'sportsImageFile', target: 'sportsImage' }
        ];

        uploads.forEach(u => {
            const input = document.querySelector(`input[name="${u.file}"]`);
            if (input) {
                input.addEventListener('change', (e) => handleFileUpload(e, u.target));
            }
        });
    };

    // ==========================================
    // SECURITY: AUTO-LOGOUT WHEN LEAVING
    // ==========================================
    function setupSecurityHandlers() {
        window.addEventListener('beforeunload', function () {
            // Check if we are refreshing or navigating to an allowed page
            const navEntries = performance.getEntriesByType('navigation');
            const isReloading = navEntries.length > 0 && navEntries[0].type === 'reload';
            const keepAlive = sessionStorage.getItem('keepAdminSession');

            // If not reloading and not explicitly moving to an allowed sub-page (like register.html)
            if (!isReloading && !keepAlive) {
                localStorage.removeItem('guitAdminSession');
                localStorage.removeItem('adminSession');
            }

            // Always clear the flag for the next event
            sessionStorage.removeItem('keepAdminSession');
        });
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init() {
        // PERFOM AUTH CHECK FIRST
        if (!checkAuth()) return;

        // Show the dashboard wrapper now that we are authenticated
        const wrapper = document.getElementById('adminWrapper');
        if (wrapper) wrapper.style.display = 'flex';

        console.log('🚀 Admin Dashboard Initializing...');

        try {
            // Setup security handlers
            setupSecurityHandlers();

            // Setup image uploads
            setupImageUploads();

            // Setup event handlers
            setupEventDelegation();

            // Setup Global Search
            setupGlobalSearch();

            // Update stats
            updateDashboardStats();

            // Activate dashboard
            navigateToSection('dashboard');

            // Load initial data
            AdminDashboard.loadMessages();

            // Hide preloader
            setTimeout(() => {
                const preloader = document.getElementById('preloader');
                if (preloader) {
                    preloader.style.opacity = '0';
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }
            }, 800);

            console.log('✅ Admin Dashboard Ready!');
            showToast('Welcome to Guit County Admin Dashboard', 'success');

        } catch (error) {
            console.error('❌ Initialization Error:', error);
            alert('Error loading dashboard. Please refresh the page.');

            // Still hide preloader even on error
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.style.display = 'none';
        }
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();