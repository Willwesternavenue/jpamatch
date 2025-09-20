// DOM要素の取得
const postTypeButtons = document.querySelectorAll('.post-type-btn');
const teamRecruitForm = document.getElementById('teamRecruitForm');
const playerSeekingForm = document.getElementById('playerSeekingForm');
const divisionCreateForm = document.getElementById('divisionCreateForm');
const teamRecruitFormElement = document.getElementById('teamRecruitFormElement');
const playerSeekingFormElement = document.getElementById('playerSeekingFormElement');
const divisionCreateFormElement = document.getElementById('divisionCreateFormElement');
const postsList = document.getElementById('postsList');
const contactModal = document.getElementById('contactModal');
const postDetailModal = document.getElementById('postDetailModal');
const contactForm = document.getElementById('contactForm');
const filterButtons = document.querySelectorAll('.filter-btn');

// モーダルの閉じるボタン
const closeButtons = document.querySelectorAll('.close');

// 現在のフィルター状態
let currentFilter = 'all';

// 投稿一覧の読み込み
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    // 投稿タイプ切り替え
    postTypeButtons.forEach(button => {
        button.addEventListener('click', () => switchPostType(button.dataset.type));
    });
    
    // フォーム送信
    teamRecruitFormElement.addEventListener('submit', handleTeamRecruitSubmit);
    playerSeekingFormElement.addEventListener('submit', handlePlayerSeekingSubmit);
    divisionCreateFormElement.addEventListener('submit', handleDivisionCreateSubmit);
    
    // 連絡フォーム
    contactForm.addEventListener('submit', handleContactSubmit);
    
    // フィルターボタン
    filterButtons.forEach(button => {
        button.addEventListener('click', () => filterPosts(button.dataset.filter));
    });
    
    // モーダルを閉じる
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            contactModal.style.display = 'none';
            postDetailModal.style.display = 'none';
        });
    });
    
    // モーダル外クリックで閉じる
    window.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            contactModal.style.display = 'none';
        }
        if (event.target === postDetailModal) {
            postDetailModal.style.display = 'none';
        }
    });
    
    // 動的フィールドの表示/非表示
    setupDynamicFields();
}

// 動的フィールドの設定
function setupDynamicFields() {
    // 参加希望人数の「その他」選択時の処理
    const playerCountSelect = document.getElementById('playerCount');
    const playerCountOther = document.getElementById('playerCountOther');
    if (playerCountSelect && playerCountOther) {
        playerCountSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                playerCountOther.style.display = 'block';
                document.getElementById('playerCountOtherText').required = true;
            } else {
                playerCountOther.style.display = 'none';
                document.getElementById('playerCountOtherText').required = false;
                document.getElementById('playerCountOtherText').value = '';
            }
        });
    }
    
    // JPA参加歴の「あり」選択時の処理
    const jpaHistorySelect = document.getElementById('jpaHistory');
    const jpaHistoryDetail = document.getElementById('jpaHistoryDetail');
    if (jpaHistorySelect && jpaHistoryDetail) {
        jpaHistorySelect.addEventListener('change', function() {
            if (this.value === 'yes') {
                jpaHistoryDetail.style.display = 'block';
                document.getElementById('jpaHistoryText').required = true;
            } else {
                jpaHistoryDetail.style.display = 'none';
                document.getElementById('jpaHistoryText').required = false;
                document.getElementById('jpaHistoryText').value = '';
            }
        });
    }
    
    // 参加可能曜日の「その他」選択時の処理
    const playerAvailabilitySelect = document.getElementById('playerAvailability');
    const playerAvailabilityOther = document.getElementById('playerAvailabilityOther');
    if (playerAvailabilitySelect && playerAvailabilityOther) {
        playerAvailabilitySelect.addEventListener('change', function() {
            if (this.value === 'other') {
                playerAvailabilityOther.style.display = 'block';
                document.getElementById('playerAvailabilityOtherText').required = true;
            } else {
                playerAvailabilityOther.style.display = 'none';
                document.getElementById('playerAvailabilityOtherText').required = false;
                document.getElementById('playerAvailabilityOtherText').value = '';
            }
        });
    }
    
    // ディビジョン作成フォーム - 募集チーム数の「その他」選択時の処理
    const divisionTeamsSelect = document.getElementById('divisionTeams');
    const divisionTeamsOther = document.getElementById('divisionTeamsOther');
    if (divisionTeamsSelect && divisionTeamsOther) {
        divisionTeamsSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                divisionTeamsOther.style.display = 'block';
                document.getElementById('divisionTeamsOtherText').required = true;
            } else {
                divisionTeamsOther.style.display = 'none';
                document.getElementById('divisionTeamsOtherText').required = false;
                document.getElementById('divisionTeamsOtherText').value = '';
            }
        });
    }
    
    // ディビジョン作成フォーム - 活動曜日の「その他」選択時の処理
    const divisionDaySelect = document.getElementById('divisionDay');
    const divisionDayOther = document.getElementById('divisionDayOther');
    if (divisionDaySelect && divisionDayOther) {
        divisionDaySelect.addEventListener('change', function() {
            if (this.value === 'other') {
                divisionDayOther.style.display = 'block';
                document.getElementById('divisionDayOtherText').required = true;
            } else {
                divisionDayOther.style.display = 'none';
                document.getElementById('divisionDayOtherText').required = false;
                document.getElementById('divisionDayOtherText').value = '';
            }
        });
    }
}

// 投稿タイプの切り替え
function switchPostType(type) {
    // ボタンのアクティブ状態を更新
    postTypeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // フォームの表示を切り替え
    if (type === 'team-recruit') {
        teamRecruitForm.style.display = 'block';
        playerSeekingForm.style.display = 'none';
        divisionCreateForm.style.display = 'none';
    } else if (type === 'player-seeking') {
        teamRecruitForm.style.display = 'none';
        playerSeekingForm.style.display = 'block';
        divisionCreateForm.style.display = 'none';
    } else if (type === 'division-create') {
        teamRecruitForm.style.display = 'none';
        playerSeekingForm.style.display = 'none';
        divisionCreateForm.style.display = 'block';
    }
}

// 投稿フィルター
function filterPosts(filter) {
    currentFilter = filter;
    
    // フィルターボタンのアクティブ状態を更新
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    // 投稿一覧を再読み込み
    loadPosts();
}

// 投稿一覧の読み込み
async function loadPosts() {
    try {
        postsList.innerHTML = '<div class="loading">投稿を読み込み中...</div>';
        
        const response = await fetch('/api/posts');
        const posts = await response.json();
        
        if (posts.length === 0) {
            postsList.innerHTML = '<div class="message">まだ投稿がありません。最初の投稿を作成してみましょう！</div>';
            return;
        }
        
        // フィルター適用
        const filteredPosts = currentFilter === 'all' 
            ? posts 
            : posts.filter(post => post.post_type === currentFilter);
        
        if (filteredPosts.length === 0) {
            postsList.innerHTML = '<div class="message">該当する投稿がありません。</div>';
            return;
        }
        
        displayPosts(filteredPosts);
    } catch (error) {
        console.error('投稿の読み込みエラー:', error);
        postsList.innerHTML = '<div class="message error">投稿の読み込みに失敗しました。</div>';
    }
}

// 投稿の表示
function displayPosts(posts) {
    postsList.innerHTML = '';
    
    posts.forEach(post => {
        const postCard = createPostCard(post);
        postsList.appendChild(postCard);
    });
}

// 投稿カードの作成
function createPostCard(post) {
    const postCard = document.createElement('div');
    postCard.className = `post-card ${post.post_type || 'general'}`;
    
    const date = new Date(post.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const postTypeText = post.post_type === 'team-recruit' ? '🏆 チーム募集' : 
                        post.post_type === 'player-seeking' ? '👤 チーム加入希望' : '🏢 ディビジョン作成';
    const postTypeClass = post.post_type === 'team-recruit' ? 'team-recruit' : 
                         post.post_type === 'player-seeking' ? 'player-seeking' : 'division-create';
    
    postCard.innerHTML = `
        <div class="post-type-badge ${postTypeClass}">${postTypeText}</div>
        <div class="post-header">
            <div>
                <h3 class="post-title" onclick="showPostDetail(${post.id})">${escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <span>投稿者: ${escapeHtml(post.author_name || '匿名')}</span>
                    <span class="post-date">${date}</span>
                </div>
            </div>
        </div>
        <div class="post-content">
            ${escapeHtml(post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content)}
        </div>
        ${createPostDetails(post)}
        <div class="post-actions">
            <button class="btn btn-secondary" onclick="showContactModal(${post.id}, '${escapeHtml(post.title)}', '${post.post_type || 'general'}')">
                連絡する
            </button>
            ${post.author_email === getCurrentUserEmail() ? 
                `<button class="btn btn-danger" onclick="deletePost(${post.id})">削除</button>` : 
                ''
            }
        </div>
    `;
    
    return postCard;
}

// 投稿詳細情報の作成
function createPostDetails(post) {
    if (post.post_type === 'team-recruit') {
        return `
            <div class="post-details">
                <h4>チーム情報</h4>
                <div class="post-details-grid">
                    ${post.team_level ? `<div class="post-detail-item"><span class="post-detail-label">レベル:</span> ${getLevelText(post.team_level)}</div>` : ''}
                    ${post.needed_players ? `<div class="post-detail-item"><span class="post-detail-label">募集人数:</span> ${post.needed_players}名</div>` : ''}
                    ${post.team_location ? `<div class="post-detail-item"><span class="post-detail-label">活動地域:</span> ${escapeHtml(post.team_location)}</div>` : ''}
                    ${post.team_frequency ? `<div class="post-detail-item"><span class="post-detail-label">活動頻度:</span> ${getFrequencyText(post.team_frequency)}</div>` : ''}
                </div>
            </div>
        `;
    } else if (post.post_type === 'player-seeking') {
        return `
            <div class="post-details">
                <h4>プレイヤー情報</h4>
                <div class="post-details-grid">
                    ${post.player_nickname ? `<div class="post-detail-item"><span class="post-detail-label">ニックネーム:</span> ${escapeHtml(post.player_nickname)}</div>` : ''}
                    ${post.player_count ? `<div class="post-detail-item"><span class="post-detail-label">参加希望人数:</span> ${escapeHtml(post.player_count)}</div>` : ''}
                    ${post.player_gender ? `<div class="post-detail-item"><span class="post-detail-label">性別:</span> ${getGenderText(post.player_gender)}</div>` : ''}
                    ${post.player_age ? `<div class="post-detail-item"><span class="post-detail-label">年齢:</span> ${getAgeText(post.player_age)}</div>` : ''}
                    ${post.player_location ? `<div class="post-detail-item"><span class="post-detail-label">活動可能地域:</span> ${escapeHtml(post.player_location)}</div>` : ''}
                    ${post.player_level ? `<div class="post-detail-item"><span class="post-detail-label">スキルレベル:</span> ${getSkillLevelText(post.player_level)}</div>` : ''}
                    ${post.player_game_type ? `<div class="post-detail-item"><span class="post-detail-label">プレーしたい種目:</span> ${getGameTypeText(post.player_game_type)}</div>` : ''}
                    ${post.player_frequency ? `<div class="post-detail-item"><span class="post-detail-label">参加可能頻度:</span> ${getFrequencyTextNew(post.player_frequency)}</div>` : ''}
                    ${post.player_availability ? `<div class="post-detail-item"><span class="post-detail-label">参加可能曜日:</span> ${escapeHtml(post.player_availability)}</div>` : ''}
                    ${post.jpa_history ? `<div class="post-detail-item"><span class="post-detail-label">JPA参加歴:</span> ${post.jpa_history === 'yes' ? 'あり' : 'なし'}${post.jpa_history_text ? ' (' + escapeHtml(post.jpa_history_text) + ')' : ''}</div>` : ''}
                </div>
            </div>
        `;
    } else if (post.post_type === 'division-create') {
        return `
            <div class="post-details">
                <h4>ディビジョン情報</h4>
                <div class="post-details-grid">
                    ${post.division_location ? `<div class="post-detail-item"><span class="post-detail-label">活動地域:</span> ${escapeHtml(post.division_location)}</div>` : ''}
                    ${post.division_shop ? `<div class="post-detail-item"><span class="post-detail-label">主な活動店舗:</span> ${escapeHtml(post.division_shop)}</div>` : ''}
                    ${post.division_teams ? `<div class="post-detail-item"><span class="post-detail-label">募集チーム数:</span> ${escapeHtml(post.division_teams)}</div>` : ''}
                    ${post.division_game_type ? `<div class="post-detail-item"><span class="post-detail-label">プレー種目:</span> ${getGameTypeText(post.division_game_type)}</div>` : ''}
                    ${post.division_day ? `<div class="post-detail-item"><span class="post-detail-label">活動曜日:</span> ${escapeHtml(post.division_day)}</div>` : ''}
                </div>
            </div>
        `;
    }
    return '';
}

// レベルテキストの取得
function getLevelText(level) {
    const levelMap = {
        'beginner': '初心者',
        'intermediate': '中級者',
        'advanced': '上級者',
        'mixed': 'レベル問わず'
    };
    return levelMap[level] || level;
}

// 頻度テキストの取得
function getFrequencyText(frequency) {
    const frequencyMap = {
        'weekly': '週1回',
        'biweekly': '週2回',
        'monthly': '月1回',
        'flexible': '不定期'
    };
    return frequencyMap[frequency] || frequency;
}

// 経験年数テキストの取得
function getExperienceText(experience) {
    const experienceMap = {
        'less-than-1': '1年未満',
        '1-3': '1-3年',
        '3-5': '3-5年',
        '5-10': '5-10年',
        'more-than-10': '10年以上'
    };
    return experienceMap[experience] || experience;
}

// 活動可能時間テキストの取得
function getAvailabilityText(availability) {
    const availabilityMap = {
        'weekday-evening': '平日夜',
        'weekend': '週末',
        'weekday-daytime': '平日昼',
        'flexible': '時間問わず'
    };
    return availabilityMap[availability] || availability;
}

// 性別テキストの取得
function getGenderText(gender) {
    const genderMap = {
        'male': '男',
        'female': '女'
    };
    return genderMap[gender] || gender;
}

// 年齢テキストの取得
function getAgeText(age) {
    const ageMap = {
        '10s': '10代',
        '20s': '20代',
        '30s': '30代',
        '40s': '40代',
        '50s': '50代',
        '60s+': '60代以上'
    };
    return ageMap[age] || age;
}

// スキルレベルテキストの取得
function getSkillLevelText(level) {
    const levelMap = {
        '1': '1（女性ビギナー）',
        '2': '2（ビギナー）',
        '3': '3（Cクラス）',
        '4': '4（Cクラス上）',
        '5': '5（Bクラス下）',
        '6': '6（Bクラス）',
        '7': '7（Bクラス上）',
        '8': '8（Aクラス）',
        '9': '9（Aクラス上）'
    };
    return levelMap[level] || level;
}

// ゲーム種目テキストの取得
function getGameTypeText(gameType) {
    const gameTypeMap = {
        '8ball': '8ボール',
        '9ball': '9ボール',
        'both': 'どちらでも'
    };
    return gameTypeMap[gameType] || gameType;
}

// 参加頻度テキストの取得（新）
function getFrequencyTextNew(frequency) {
    const frequencyMap = {
        '2plus-per-week': '週2度以上',
        '1-per-week': '週1度',
        'biweekly': '2週に1度',
        'monthly': '月に1,2度'
    };
    return frequencyMap[frequency] || frequency;
}

// 投稿詳細の表示
async function showPostDetail(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`);
        const post = await response.json();
        
        const postDetail = document.getElementById('postDetail');
        const date = new Date(post.created_at).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const postTypeText = post.post_type === 'team-recruit' ? '🏆 チーム募集' : 
                            post.post_type === 'player-seeking' ? '👤 チーム加入希望' : '🏢 ディビジョン作成';
        
        postDetail.innerHTML = `
            <h3>${escapeHtml(post.title)}</h3>
            <div class="meta">
                <p><strong>投稿タイプ:</strong> ${postTypeText}</p>
                <p><strong>投稿者:</strong> ${escapeHtml(post.author_name || '匿名')}</p>
                <p><strong>投稿日時:</strong> ${date}</p>
            </div>
            <div class="content">
                ${escapeHtml(post.content).replace(/\n/g, '<br>')}
            </div>
            ${createPostDetails(post)}
            <div style="margin-top: 1.5rem;">
                <button class="btn btn-secondary" onclick="showContactModal(${post.id}, '${escapeHtml(post.title)}', '${post.post_type || 'general'}')">
                    連絡する
                </button>
            </div>
        `;
        
        postDetailModal.style.display = 'block';
    } catch (error) {
        console.error('投稿詳細の読み込みエラー:', error);
        alert('投稿詳細の読み込みに失敗しました。');
    }
}

// 連絡モーダルの表示
function showContactModal(postId, postTitle, postType) {
    document.getElementById('postId').value = postId;
    document.getElementById('postTitle').value = postTitle;
    document.getElementById('postType').value = postType;
    contactModal.style.display = 'block';
}

// チーム募集フォームの送信
async function handleTeamRecruitSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(teamRecruitFormElement);
    const postData = {
        title: formData.get('title'),
        content: formData.get('content'),
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'team-recruit',
        team_level: formData.get('teamLevel'),
        needed_players: formData.get('neededPlayers'),
        team_location: formData.get('teamLocation'),
        team_frequency: formData.get('teamFrequency')
    };
    
    await submitPost(postData, 'チーム募集が正常に投稿されました！');
}

// チーム加入希望フォームの送信
async function handlePlayerSeekingSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(playerSeekingFormElement);
    
    // 参加希望人数の処理
    let playerCount = formData.get('playerCount');
    if (playerCount === 'other') {
        playerCount = formData.get('playerCountOtherText');
    }
    
    // JPA参加歴の処理
    let jpaHistory = formData.get('jpaHistory');
    let jpaHistoryText = '';
    if (jpaHistory === 'yes') {
        jpaHistoryText = formData.get('jpaHistoryText');
    }
    
    // 参加可能曜日の処理
    let playerAvailability = formData.get('playerAvailability');
    if (playerAvailability === 'other') {
        playerAvailability = formData.get('playerAvailabilityOtherText');
    }
    
    const postData = {
        title: `チーム加入希望 - ${formData.get('playerNickname')}`,
        content: `ニックネーム: ${formData.get('playerNickname')}\n参加希望人数: ${playerCount}\n活動可能地域: ${formData.get('playerLocation')}\nビリヤード歴: ${formData.get('playerExperience')}\nJPA参加歴: ${jpaHistory === 'yes' ? 'あり' : 'なし'}${jpaHistoryText ? '\n参加期間: ' + jpaHistoryText : ''}`,
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'player-seeking',
        player_nickname: formData.get('playerNickname'),
        player_count: playerCount,
        player_gender: formData.get('playerGender'),
        player_age: formData.get('playerAge'),
        player_location: formData.get('playerLocation'),
        player_experience: formData.get('playerExperience'),
        jpa_history: jpaHistory,
        jpa_history_text: jpaHistoryText,
        player_level: formData.get('playerLevel'),
        player_game_type: formData.get('playerGameType'),
        player_frequency: formData.get('playerFrequency'),
        player_availability: playerAvailability
    };
    
    await submitPost(postData, 'チーム加入希望が正常に投稿されました！');
}

// ディビジョン作成フォームの送信
async function handleDivisionCreateSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(divisionCreateFormElement);
    
    // 募集チーム数の処理
    let divisionTeams = formData.get('divisionTeams');
    if (divisionTeams === 'other') {
        divisionTeams = formData.get('divisionTeamsOtherText');
    }
    
    // 活動曜日の処理
    let divisionDay = formData.get('divisionDay');
    if (divisionDay === 'other') {
        divisionDay = formData.get('divisionDayOtherText');
    }
    
    const postData = {
        title: `ディビジョン作成希望 - ${formData.get('divisionLocation')}`,
        content: `活動地域: ${formData.get('divisionLocation')}\n募集チーム数: ${divisionTeams}\nプレー種目: ${formData.get('divisionGameType')}${formData.get('divisionShop') ? '\n主な活動店舗: ' + formData.get('divisionShop') : ''}${divisionDay ? '\n活動曜日: ' + divisionDay : ''}`,
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'division-create',
        division_location: formData.get('divisionLocation'),
        division_shop: formData.get('divisionShop'),
        division_teams: divisionTeams,
        division_game_type: formData.get('divisionGameType'),
        division_day: divisionDay
    };
    
    await submitPost(postData, 'ディビジョン作成希望が正常に投稿されました！');
}

// 投稿の送信（共通処理）
async function submitPost(postData, successMessage) {
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        if (response.ok) {
            showMessage(successMessage, 'success');
            // フォームをリセット
            if (postData.post_type === 'team-recruit') {
                teamRecruitFormElement.reset();
            } else if (postData.post_type === 'player-seeking') {
                playerSeekingFormElement.reset();
            } else if (postData.post_type === 'division-create') {
                divisionCreateFormElement.reset();
            }
            loadPosts(); // 投稿一覧を再読み込み
        } else {
            const error = await response.json();
            showMessage(`投稿の作成に失敗しました: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('投稿エラー:', error);
        showMessage('投稿の作成に失敗しました。', 'error');
    }
}

// 連絡フォームの送信
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
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        
        if (response.ok) {
            showMessage('メールが正常に送信されました！', 'success');
            contactForm.reset();
            contactModal.style.display = 'none';
        } else {
            const error = await response.json();
            showMessage(`メール送信に失敗しました: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('メール送信エラー:', error);
        showMessage('メール送信に失敗しました。', 'error');
    }
}

// 投稿の削除
async function deletePost(postId) {
    if (!confirm('この投稿を削除しますか？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author_email: getCurrentUserEmail()
            })
        });
        
        if (response.ok) {
            showMessage('投稿が削除されました。', 'success');
            loadPosts(); // 投稿一覧を再読み込み
        } else {
            const error = await response.json();
            showMessage(`投稿の削除に失敗しました: ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('削除エラー:', error);
        showMessage('投稿の削除に失敗しました。', 'error');
    }
}

// メッセージの表示
function showMessage(message, type = 'success') {
    // 既存のメッセージを削除
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // 投稿タイプ選択セクションの上に表示
    const postTypeSection = document.querySelector('.post-type-section');
    postTypeSection.parentNode.insertBefore(messageDiv, postTypeSection);
    
    // 3秒後に自動削除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 現在のユーザーのメールアドレスを取得（簡易版）
function getCurrentUserEmail() {
    // 実際の実装では、ログイン機能やセッション管理から取得
    // ここでは簡易的にローカルストレージから取得
    return localStorage.getItem('currentUserEmail') || '';
}

// フォーム送信時にメールアドレスを保存
teamRecruitFormElement.addEventListener('submit', (event) => {
    const email = event.target.querySelector('[name="authorEmail"]').value;
    if (email) {
        localStorage.setItem('currentUserEmail', email);
    }
});

playerSeekingFormElement.addEventListener('submit', (event) => {
    const email = event.target.querySelector('[name="authorEmail"]').value;
    if (email) {
        localStorage.setItem('currentUserEmail', email);
    }
});

divisionCreateFormElement.addEventListener('submit', (event) => {
    const email = event.target.querySelector('[name="authorEmail"]').value;
    if (email) {
        localStorage.setItem('currentUserEmail', email);
    }
});
