// DOM要素の取得
const postTypeButtons = document.querySelectorAll('.post-type-btn');
const teamRecruitForm = document.getElementById('teamRecruitForm');
const playerSeekingForm = document.getElementById('playerSeekingForm');
const teamRecruitFormElement = document.getElementById('teamRecruitFormElement');
const playerSeekingFormElement = document.getElementById('playerSeekingFormElement');
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
    } else {
        teamRecruitForm.style.display = 'none';
        playerSeekingForm.style.display = 'block';
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
    
    const postTypeText = post.post_type === 'team-recruit' ? '🏆 チーム募集' : '👤 チーム加入希望';
    const postTypeClass = post.post_type === 'team-recruit' ? 'team-recruit' : 'player-seeking';
    
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
                    ${post.player_level ? `<div class="post-detail-item"><span class="post-detail-label">レベル:</span> ${getLevelText(post.player_level)}</div>` : ''}
                    ${post.player_experience ? `<div class="post-detail-item"><span class="post-detail-label">経験年数:</span> ${getExperienceText(post.player_experience)}</div>` : ''}
                    ${post.player_location ? `<div class="post-detail-item"><span class="post-detail-label">希望地域:</span> ${escapeHtml(post.player_location)}</div>` : ''}
                    ${post.player_availability ? `<div class="post-detail-item"><span class="post-detail-label">活動可能時間:</span> ${getAvailabilityText(post.player_availability)}</div>` : ''}
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
        
        const postTypeText = post.post_type === 'team-recruit' ? '🏆 チーム募集' : '👤 チーム加入希望';
        
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
    const postData = {
        title: formData.get('title'),
        content: formData.get('content'),
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'player-seeking',
        player_level: formData.get('playerLevel'),
        player_experience: formData.get('playerExperience'),
        player_location: formData.get('playerLocation'),
        player_availability: formData.get('playerAvailability')
    };
    
    await submitPost(postData, 'チーム加入希望が正常に投稿されました！');
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
            } else {
                playerSeekingFormElement.reset();
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
