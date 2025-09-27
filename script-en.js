// English version of script.js
// API Base URL
const API_BASE_URL = window.location.origin;

// DOM Elements
const postTypeButtons = document.querySelectorAll('.post-type-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const filterButtons = document.querySelectorAll('.filter-btn');
const teamRecruitFormElement = document.getElementById('teamRecruitFormElement');
const playerSeekingFormElement = document.getElementById('playerSeekingFormElement');
const divisionCreateFormElement = document.getElementById('divisionCreateFormElement');
const postsList = document.getElementById('postsList');
const contactModal = document.getElementById('contactModal');
const postDetailModal = document.getElementById('postDetailModal');
const contactForm = document.getElementById('contactForm');
const deleteModal = document.getElementById('deleteModal');
const closeButtons = document.querySelectorAll('.close');

// Current filter
let currentFilter = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadPosts();
    
    // Initialize form display state
    hideAllForms();
    
    // Show team recruit form by default if on create tab
    const createTab = document.getElementById('createTab');
    if (createTab && createTab.classList.contains('active')) {
        setTimeout(() => {
            const teamRecruitForm = document.getElementById('teamRecruitForm');
            if (teamRecruitForm) {
                teamRecruitForm.style.display = 'block';
                teamRecruitForm.classList.add('active');
            }
            const teamButton = document.querySelector('[data-type="team-recruit"]');
            if (teamButton) {
                teamButton.classList.add('active');
            }
        }, 100);
    }
});

// Setup event listeners
function setupEventListeners() {
    // Post type switching
    postTypeButtons.forEach(button => {
        button.addEventListener('click', () => switchPostType(button.dataset.type));
    });
    
    // Form submissions
    teamRecruitFormElement.addEventListener('submit', handleTeamRecruitSubmit);
    playerSeekingFormElement.addEventListener('submit', handlePlayerSeekingSubmit);
    divisionCreateFormElement.addEventListener('submit', handleDivisionCreateSubmit);
    
    // Contact form
    contactForm.addEventListener('submit', handleContactSubmit);
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => filterPosts(button.dataset.filter));
    });
    
    // Tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    // Modal close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            contactModal.style.display = 'none';
            postDetailModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            contactModal.style.display = 'none';
        }
        if (event.target === postDetailModal) {
            postDetailModal.style.display = 'none';
        }
    });
    
    // Dynamic fields setup
    setupDynamicFields();
}

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tab buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    // Remove active class from all tab contents
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab button
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Add active class to corresponding tab content
    const activeContent = document.getElementById(`${tabName}Tab`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // When returning to posts tab, hide all forms
    if (tabName === 'posts') {
        hideAllForms();
        // Reload posts
        loadPosts();
    }
}

// Hide all forms
function hideAllForms() {
    const forms = document.querySelectorAll('.post-form-section');
    forms.forEach(form => {
        form.style.display = 'none';
        form.classList.remove('active');
    });
    
    // Reset post type buttons
    postTypeButtons.forEach(btn => btn.classList.remove('active'));
}

// Dynamic fields setup
function setupDynamicFields() {
    // Team recruiting - number of players needed "Other"
    const neededPlayersSelect = document.getElementById('neededPlayers');
    const neededPlayersOther = document.getElementById('neededPlayersOther');
    if (neededPlayersSelect && neededPlayersOther) {
        neededPlayersSelect.addEventListener('change', function() {
            neededPlayersOther.style.display = this.value === 'other' ? 'block' : 'none';
        });
    }
    
    // Team recruiting - activity days "Other"
    const teamAvailabilitySelect = document.getElementById('teamAvailability');
    const teamAvailabilityOther = document.getElementById('teamAvailabilityOther');
    if (teamAvailabilitySelect && teamAvailabilityOther) {
        teamAvailabilitySelect.addEventListener('change', function() {
            teamAvailabilityOther.style.display = this.value === 'other' ? 'block' : 'none';
        });
    }
    
    // Player seeking - number of people "Other"
    const playerCountSelect = document.getElementById('playerCount');
    const playerCountOther = document.getElementById('playerCountOther');
    if (playerCountSelect && playerCountOther) {
        playerCountSelect.addEventListener('change', function() {
            playerCountOther.style.display = this.value === 'other' ? 'block' : 'none';
        });
    }
    
    // Player seeking - JPA participation history "Yes"
    const jpaHistorySelect = document.getElementById('jpaHistory');
    const jpaHistoryYes = document.getElementById('jpaHistoryYes');
    if (jpaHistorySelect && jpaHistoryYes) {
        jpaHistorySelect.addEventListener('change', function() {
            jpaHistoryYes.style.display = this.value === 'yes' ? 'block' : 'none';
        });
    }
    
    // Player seeking - available days "Other"
    const playerAvailabilitySelect = document.getElementById('playerAvailability');
    const playerAvailabilityOther = document.getElementById('playerAvailabilityOther');
    if (playerAvailabilitySelect && playerAvailabilityOther) {
        playerAvailabilitySelect.addEventListener('change', function() {
            playerAvailabilityOther.style.display = this.value === 'other' ? 'block' : 'none';
        });
    }
    
    // Division creation - number of teams "Other"
    const divisionTeamsSelect = document.getElementById('divisionTeams');
    const divisionTeamsOther = document.getElementById('divisionTeamsOther');
    if (divisionTeamsSelect && divisionTeamsOther) {
        divisionTeamsSelect.addEventListener('change', function() {
            divisionTeamsOther.style.display = this.value === 'other' ? 'block' : 'none';
        });
    }
    
    // Division creation - activity days "Other"
    const divisionDaySelect = document.getElementById('divisionDay');
    const divisionDayOther = document.getElementById('divisionDayOther');
    if (divisionDaySelect && divisionDayOther) {
        divisionDaySelect.addEventListener('change', function() {
            divisionDayOther.style.display = this.value === 'other' ? 'block' : 'none';
        });
    }
}

// Post type switching
function switchPostType(type) {
    // Hide all forms with proper timing
    const forms = document.querySelectorAll('.post-form-section');
    forms.forEach(form => {
        form.style.display = 'none';
        form.classList.remove('active');
    });
    
    // Show selected form with proper timing
    setTimeout(() => {
        const selectedForm = document.getElementById(`${type}Form`);
        if (selectedForm) {
            selectedForm.style.display = 'block';
            selectedForm.classList.add('active');
        }
    }, 50);
    
    // Update button states
    postTypeButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`[data-type="${type}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Filter posts
function filterPosts(filter) {
    currentFilter = filter;
    
    // Update button states
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`[data-filter="${filter}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Reload posts with filter
    loadPosts();
}

// Load posts
async function loadPosts() {
    try {
        postsList.innerHTML = '<div class="loading">Loading posts...</div>';
        
        // Use actual API with strong cache buster
        const cacheBuster = `t=${Date.now()}&r=${Math.random()}`;
        const response = await fetch(`${API_BASE_URL}/api/posts/?${cacheBuster}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        console.log('loadPosts - Number of posts retrieved:', posts.length);
        console.log('loadPosts - Post data:', posts);
        
        if (posts.length === 0) {
            postsList.innerHTML = '<div class="message">No posts yet. Create the first post!</div>';
            return;
        }
        
        // Filter posts based on current filter
        const filteredPosts = currentFilter === 'all' 
            ? posts 
            : posts.filter(post => post.post_type === currentFilter);
        
        if (filteredPosts.length === 0) {
            postsList.innerHTML = '<div class="message">No posts match the selected filter.</div>';
            return;
        }
        
        displayPosts(filteredPosts);
    } catch (error) {
        console.error('Error loading posts:', error);
        postsList.innerHTML = '<div class="message error">Failed to load posts.</div>';
    }
}

// Display posts
function displayPosts(posts) {
    postsList.innerHTML = '';
    
    posts.forEach(post => {
        const postCard = createPostCard(post);
        postsList.appendChild(postCard);
    });
}

// Create post card
function createPostCard(post) {
    const postCard = document.createElement('div');
    postCard.className = `post-card ${post.post_type || 'general'}`;
    
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const postTypeText = post.post_type === 'team-recruit' ? '🏆 Team Recruiting' : 
                        post.post_type === 'player-seeking' ? '👤 Looking for Team' : '🏢 Create Division';
    const postTypeClass = post.post_type === 'team-recruit' ? 'team-recruit' : 
                         post.post_type === 'player-seeking' ? 'player-seeking' : 'division-create';
    
    postCard.setAttribute('data-post-id', post.id);
    
    postCard.innerHTML = `
        <div class="post-type-badge ${postTypeClass}">${postTypeText}</div>
        <div class="post-header">
            <div class="post-content-main">
                ${post.content && post.content.trim() !== '' ? 
                    escapeHtml(post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content) : 
                    escapeHtml(post.title || 'No Title')
                }
            </div>
        </div>
        <div class="post-meta">
            <span>Author: ${escapeHtml(getDisplayName(post) || 'Anonymous')}</span>
            <span class="post-date">${date}</span>
        </div>
        ${createPostDetails(post)}
        <div class="post-actions">
            <button class="btn btn-secondary" onclick="showContactModal('${post.id}', '${escapeHtml(post.title)}', '${post.post_type || 'general'}')">
                Contact
            </button>
            <button class="btn btn-danger" onclick="showDeleteModal('${post.id}', '${escapeHtml(post.title)}')">Delete</button>
        </div>
    `;
    
    return postCard;
}

// Create post details
function createPostDetails(post) {
    if (post.post_type === 'team-recruit') {
        return `
            <div class="post-details">
                <h4>Team Information</h4>
                <div class="post-details-grid">
                    ${post.needed_players ? `<div class="post-detail-item"><span class="post-detail-label">Players Needed:</span> ${post.needed_players} people</div>` : ''}
                    ${post.team_location ? `<div class="post-detail-item"><span class="post-detail-label">Activity Area:</span> ${getLocationText(post.team_location)}${post.team_location_detail ? ` (${escapeHtml(post.team_location_detail)})` : ''}</div>` : ''}
                    ${post.team_jpa_history ? `<div class="post-detail-item"><span class="post-detail-label">JPA Participation History:</span> ${getJpaHistoryText(post.team_jpa_history)}</div>` : ''}
                    ${post.team_skill_level ? `<div class="post-detail-item"><span class="post-detail-label">Desired Skill Level Range:</span> ${getSkillLevelRangeText(post.team_skill_level)}</div>` : ''}
                    ${post.team_game_type ? `<div class="post-detail-item"><span class="post-detail-label">Game Type:</span> ${getGameTypeText(post.team_game_type)}</div>` : ''}
                    ${post.team_frequency ? `<div class="post-detail-item"><span class="post-detail-label">Desired Participation Frequency:</span> ${getFrequencyTextNew(post.team_frequency)}</div>` : ''}
                    ${post.team_availability ? `<div class="post-detail-item"><span class="post-detail-label">Activity Days:</span> ${getAvailabilityText(post.team_availability)}</div>` : ''}
                    ${post.team_self_intro ? `<div class="post-detail-item"><span class="post-detail-label">Self Introduction:</span> ${escapeHtml(post.team_self_intro)}</div>` : ''}
                </div>
            </div>
        `;
    } else if (post.post_type === 'player-seeking') {
        return `
            <div class="post-details">
                <h4>Player Information</h4>
                <div class="post-details-grid">
                    ${post.player_count ? `<div class="post-detail-item"><span class="post-detail-label">People Seeking to Join:</span> ${escapeHtml(post.player_count)}</div>` : ''}
                    ${post.player_gender ? `<div class="post-detail-item"><span class="post-detail-label">Gender:</span> ${getGenderText(post.player_gender)}</div>` : ''}
                    ${post.player_age ? `<div class="post-detail-item"><span class="post-detail-label">Age:</span> ${getAgeText(post.player_age)}</div>` : ''}
                    ${post.player_location ? `<div class="post-detail-item"><span class="post-detail-label">Activity Area:</span> ${getLocationText(post.player_location)}</div>` : ''}
                    ${post.player_level ? `<div class="post-detail-item"><span class="post-detail-label">Skill Level:</span> ${getSkillLevelText(post.player_level)}</div>` : ''}
                    ${post.player_game_type ? `<div class="post-detail-item"><span class="post-detail-label">Preferred Game Type:</span> ${getGameTypeText(post.player_game_type)}</div>` : ''}
                    ${post.player_frequency ? `<div class="post-detail-item"><span class="post-detail-label">Available Participation Frequency:</span> ${getFrequencyTextNew(post.player_frequency)}</div>` : ''}
                    ${post.player_availability ? `<div class="post-detail-item"><span class="post-detail-label">Available Days:</span> ${getAvailabilityText(post.player_availability)}</div>` : ''}
                    ${post.jpa_history ? `<div class="post-detail-item"><span class="post-detail-label">JPA Participation History:</span> ${post.jpa_history === 'yes' ? 'Yes' : 'No'}${post.jpa_history_text ? ' (' + escapeHtml(post.jpa_history_text) + ')' : ''}</div>` : ''}
                    ${post.player_self_intro ? `<div class="post-detail-item"><span class="post-detail-label">Self Introduction:</span> ${escapeHtml(post.player_self_intro)}</div>` : ''}
                </div>
            </div>
        `;
    } else if (post.post_type === 'division-create') {
        return `
            <div class="post-details">
                <h4>Division Information</h4>
                <div class="post-details-grid">
                    ${post.division_location ? `<div class="post-detail-item"><span class="post-detail-label">Activity Area:</span> ${getLocationText(post.division_location)}</div>` : ''}
                    ${post.division_shop ? `<div class="post-detail-item"><span class="post-detail-label">Main Activity Shop:</span> ${escapeHtml(post.division_shop)}</div>` : ''}
                    ${post.division_teams ? `<div class="post-detail-item"><span class="post-detail-label">Teams to Recruit:</span> ${escapeHtml(post.division_teams)}</div>` : ''}
                    ${post.division_game_type ? `<div class="post-detail-item"><span class="post-detail-label">Game Type:</span> ${getGameTypeText(post.division_game_type)}</div>` : ''}
                    ${post.division_day ? `<div class="post-detail-item"><span class="post-detail-label">Activity Days:</span> ${getDivisionDayText(post.division_day)}</div>` : ''}
                </div>
            </div>
        `;
    }
    return '';
}

// Get display name
function getDisplayName(post) {
    console.log('getDisplayName called with post:', post);
    console.log('post_type:', post.post_type);
    console.log('nickname:', post.nickname);
    console.log('author_name:', post.author_name);
    
    // Return nickname if available, otherwise return null (will show as "Anonymous")
    return post.nickname || null;
}

// Location text conversion
function getLocationText(location) {
    const locationMap = {
        'hokkaido': 'Hokkaido',
        'tohoku': 'Tohoku',
        'kanto': 'Kanto',
        'capital': 'Capital Region',
        'tokai': 'Tokai',
        'hokuriku': 'Hokuriku',
        'kansai': 'Kansai',
        'chugoku': 'Chugoku',
        'shikoku': 'Shikoku',
        'kyushu': 'Kyushu',
        'okinawa': 'Okinawa'
    };
    return locationMap[location] || location;
}

// JPA history text conversion
function getJpaHistoryText(history) {
    const historyMap = {
        'participating': 'Currently participating',
        'suspended': 'Previously participated, currently suspended',
        'planning': 'Planning to participate'
    };
    return historyMap[history] || history;
}

// Skill level range text conversion
function getSkillLevelRangeText(level) {
    const levelMap = {
        '1-3': '1-3',
        '3-4': '3-4',
        '4-5': '4-5',
        '5-7': '5-7',
        '7-9': '7-9',
        '9': '9'
    };
    return levelMap[level] || level;
}

// Game type text conversion
function getGameTypeText(type) {
    const typeMap = {
        '8ball': '8-Ball',
        '9ball': '9-Ball',
        'both': 'Either'
    };
    return typeMap[type] || type;
}

// Frequency text conversion (new version)
function getFrequencyTextNew(frequency) {
    const frequencyMap = {
        'more-than-weekly': 'More than once a week',
        'weekly': 'Once a week',
        'twice-weekly': 'Twice a week',
        'more-than-twice-weekly': 'More than twice a week',
        '1-per-week': 'Once a week',
        'biweekly': 'Once every two weeks',
        'monthly': '1-2 times a month'
    };
    return frequencyMap[frequency] || frequency;
}

// Availability text conversion
function getAvailabilityText(availability) {
    const availabilityMap = {
        'weekday-evening': 'Weekday evenings',
        'weekend': 'Weekends',
        'weekday-daytime': 'Weekday daytime',
        'weekday': 'Weekdays',
        'weekends': 'Weekends/Holidays',
        'anytime': 'Anytime',
        'flexible': 'Flexible'
    };
    return availabilityMap[availability] || availability;
}

// Division day text conversion
function getDivisionDayText(day) {
    const dayMap = {
        'weekday': 'Weekdays',
        'weekend': 'Weekends/Holidays',
        'decide': 'To be decided',
        'other': 'Other'
    };
    return dayMap[day] || day;
}

// Gender text conversion
function getGenderText(gender) {
    const genderMap = {
        'male': 'Male',
        'female': 'Female'
    };
    return genderMap[gender] || gender;
}

// Age text conversion
function getAgeText(age) {
    const ageMap = {
        'teens': 'Teens',
        '20s': '20s',
        '30s': '30s',
        '40s': '40s',
        '50s': '50s',
        '60plus': '60+'
    };
    return ageMap[age] || age;
}

// Skill level text conversion
function getSkillLevelText(level) {
    const levelMap = {
        '1': '1 (Female Beginner)',
        '2': '2 (Beginner)',
        '3': '3 (Class C)',
        '4': '4 (Class C+)',
        '5': '5 (Class B-)',
        '6': '6 (Class B)',
        '7': '7 (Class B+)',
        '8': '8 (Class A)',
        '9': '9 (Class A+)'
    };
    return levelMap[level] || level;
}

// Submit post
async function submitPost(postData, successMessage) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        if (response.ok) {
            showMessage(successMessage, 'success');
            // Hide all forms and switch to posts tab
            hideAllForms();
            switchTab('posts');
            loadPosts();
        } else {
            const error = await response.json();
            showMessage(`Failed to create post: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Post error:', error);
        showMessage('Failed to create post.', 'error');
    }
}

// Team recruiting form submission
async function handleTeamRecruitSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(teamRecruitFormElement);
    
    let neededPlayers = formData.get('neededPlayers');
    if (neededPlayers === 'other') {
        neededPlayers = formData.get('neededPlayersOtherText');
    }
    
    let teamAvailability = formData.get('teamAvailability');
    if (teamAvailability === 'other') {
        teamAvailability = formData.get('teamAvailabilityOtherText');
    }
    
    const postData = {
        title: formData.get('teamTitle') || 'Team Recruiting',
        content: 'Looking for teammates.',
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'team-recruit',
        delete_pin: formData.get('teamPin'),
        nickname: formData.get('teamNickname'),
        needed_players: neededPlayers,
        team_location: formData.get('teamLocation'),
        team_location_detail: formData.get('teamLocationDetail'),
        team_jpa_history: formData.get('teamJpaHistory'),
        team_skill_level: formData.get('teamSkillLevel'),
        team_game_type: formData.get('teamGameType'),
        team_frequency: formData.get('teamFrequency'),
        team_availability: teamAvailability,
        team_self_intro: formData.get('teamSelfIntro')
    };
    
    await submitPost(postData, 'Team recruiting post created successfully!');
}

// Player seeking form submission
async function handlePlayerSeekingSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(playerSeekingFormElement);
    
    let playerCount = formData.get('playerCount');
    if (playerCount === 'other') {
        playerCount = formData.get('playerCountOtherText');
    }
    
    const playerGender = formData.get('playerGender');
    const playerLevel = formData.get('playerLevel');
    const playerGameType = formData.get('playerGameType');
    const playerFrequency = formData.get('playerFrequency');
    
    let playerAvailability = formData.get('playerAvailability');
    if (playerAvailability === 'other') {
        playerAvailability = formData.get('playerAvailabilityOtherText');
    }
    
    const postData = {
        title: formData.get('playerTitle') || 'Looking for Team',
        content: 'Looking to join a team.',
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'player-seeking',
        delete_pin: formData.get('playerPin'),
        nickname: formData.get('playerNickname'),
        player_count: playerCount,
        player_gender: playerGender && playerGender !== '' ? playerGender : null,
        player_age: playerAge && playerAge !== '' ? playerAge : null,
        player_location: formData.get('playerLocation'),
        player_experience: formData.get('playerExperience'),
        jpa_history: formData.get('jpaHistory'),
        jpa_history_text: formData.get('jpaHistoryText'),
        player_level: playerLevel,
        player_game_type: playerGameType,
        player_frequency: playerFrequency,
        player_availability: playerAvailability,
        player_self_intro: formData.get('playerSelfIntro')
    };
    
    await submitPost(postData, 'Looking for team post created successfully!');
}

// Division creation form submission
async function handleDivisionCreateSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(divisionCreateFormElement);
    
    let divisionTeams = formData.get('divisionTeams');
    if (divisionTeams === 'other') {
        divisionTeams = formData.get('divisionTeamsOtherText');
    }
    
    let divisionDay = formData.get('divisionDay');
    if (divisionDay === 'other') {
        divisionDay = formData.get('divisionDayOtherText');
    }
    
    const postData = {
        title: formData.get('divisionTitle') || 'Create Division',
        content: 'Looking to create a new division.',
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'division-create',
        delete_pin: formData.get('divisionPin'),
        nickname: formData.get('divisionNickname'),
        division_location: formData.get('divisionLocation'),
        division_shop: formData.get('divisionShop'),
        division_teams: divisionTeams,
        division_game_type: formData.get('divisionGameType'),
        division_day: divisionDay
    };
    
    await submitPost(postData, 'Division creation request posted successfully!');
}

// Contact form submission
async function handleContactSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = {
        postId: formData.get('postId'),
        postTitle: formData.get('postTitle'),
        postType: formData.get('postType'),
        senderName: formData.get('senderName'),
        senderEmail: formData.get('senderEmail'),
        message: formData.get('message')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage('✅ Email sent successfully! Contact email sent to poster and confirmation email sent to you.', 'success');
            contactForm.reset();
            contactModal.style.display = 'none';
        } else {
            const error = await response.json();
            showMessage(`Failed to send email: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Email sending error:', error);
        showMessage('Failed to send email.', 'error');
    }
}

// Show contact modal
function showContactModal(postId, postTitle, postType) {
    document.getElementById('postId').value = postId;
    document.getElementById('postTitle').value = postTitle;
    document.getElementById('postType').value = postType;
    contactModal.style.display = 'block';
}

// Show delete modal
function showDeleteModal(postId, postTitle) {
    try {
        const deleteModal = document.getElementById('deleteModal');
        const deletePinInput = document.getElementById('deletePin');
        
        if (!deleteModal || !deletePinInput) {
            console.error('Delete modal elements not found');
            alert('Failed to initialize delete modal. Please reload the page.');
            return;
        }
        
        console.log('Showing delete modal. Post ID:', postId);
        deletePinInput.value = '';
        deleteModal.style.display = 'block';
        
        // Set up form submission
        const deleteForm = document.getElementById('deleteForm');
        if (deleteForm) {
            deleteForm.onsubmit = (e) => {
                e.preventDefault();
                deletePost(postId);
            };
        }
    } catch (error) {
        console.error('Error showing delete modal:', error);
        alert('Failed to show delete modal. Please reload the page.');
    }
}

// Delete post
async function deletePost(postId) {
    const deletePin = document.getElementById('deletePin').value;
    
    if (!deletePin || deletePin.length !== 4) {
        showMessage('Please enter a valid 4-digit PIN.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ delete_pin: deletePin })
        });
        
        if (response.ok) {
            showMessage('Post deleted successfully!', 'success');
            deleteModal.style.display = 'none';
            loadPosts();
        } else {
            const error = await response.json();
            showMessage(`Failed to delete post: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('Failed to delete post.', 'error');
    }
}

// Initialize delete modal
function initializeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    if (!deleteModal) return;
    
    // Cancel button
    document.getElementById('cancelDelete').addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });
    
    // Modal close button
    const closeBtn = deleteModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDeleteModal);
} else {
    initializeDeleteModal();
}

// Show message
function showMessage(message, type = 'success') {
    // Remove existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add styles to make it more visible
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 16px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ${type === 'success' ? 
            'background: #27ae60; color: white;' : 
            'background: #e74c3c; color: white;'
        }
    `;
    
    // Add to body directly
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// HTML escape
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
