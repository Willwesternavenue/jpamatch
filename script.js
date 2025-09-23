// API設定 - 本番環境では相対パス、開発環境では絶対パスを使用
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

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

// タブ関連のDOM要素
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

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
    
    // タブボタン
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
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

// タブ切り替え
function switchTab(tabName) {
    // すべてのタブボタンからactiveクラスを削除
    tabButtons.forEach(btn => btn.classList.remove('active'));
    // すべてのタブコンテンツからactiveクラスを削除
    tabContents.forEach(content => content.classList.remove('active'));
    
    // クリックされたタブボタンにactiveクラスを追加
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // 対応するタブコンテンツにactiveクラスを追加
    const activeContent = document.getElementById(`${tabName}Tab`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// 動的フィールドの設定
function setupDynamicFields() {
    // チームメイト募集人数の「その他」
    const neededPlayersSelect = document.getElementById('neededPlayers');
    const neededPlayersOther = document.getElementById('neededPlayersOther');
    if (neededPlayersSelect && neededPlayersOther) {
        neededPlayersSelect.addEventListener('change', function() {
            neededPlayersOther.style.display = this.value === 'other' ? 'block' : 'none';
        });
    }
    
    // チーム活動曜日の「その他」
    const teamAvailabilitySelect = document.getElementById('teamAvailability');
    const teamAvailabilityOther = document.getElementById('teamAvailabilityOther');
    if (teamAvailabilitySelect && teamAvailabilityOther) {
        teamAvailabilitySelect.addEventListener('change', function() {
            teamAvailabilityOther.style.display = this.value === 'other' ? 'block' : 'none';
        });
    }
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

// ダミーデータ
const dummyPosts = [
    // チーム募集
    {
        id: 1,
        title: "ビリヤードクラブ エース",
        content: "初心者から上級者まで幅広く募集しています。週1回の練習で、楽しくビリヤードを楽しみましょう！",
        author_name: "田中太郎",
        author_email: "tanaka@example.com",
        post_type: "team-recruit",
        created_at: "2024-09-20T10:00:00Z",
        delete_pin: "1234",
        team_nickname: "東京ビリヤードクラブ",
        team_level: "mixed",
        needed_players: "2",
        team_location: "kanto",
        team_frequency: "weekly"
    },
    {
        id: 2,
        title: "関西ビリヤード愛好会",
        content: "関西地区で活動しているビリヤード愛好会です。中級者以上を募集しています。",
        author_name: "佐藤花子",
        author_email: "sato@example.com",
        post_type: "team-recruit",
        created_at: "2024-09-19T15:30:00Z",
        delete_pin: "5678",
        team_nickname: "関西ビリヤード愛好会",
        team_level: "intermediate",
        needed_players: "3",
        team_location: "kansai",
        team_frequency: "biweekly"
    },
    // チーム加入希望
    {
        id: 3,
        title: "チームを探しています",
        content: "ニックネーム: ビリヤード太郎\n参加希望人数: 1人\n活動可能地域: 関東\nビリヤード歴: 2年程度の経験があります\nJPA参加歴: なし",
        author_name: "山田次郎",
        author_email: "yamada@example.com",
        post_type: "player-seeking",
        created_at: "2024-09-18T09:15:00Z",
        delete_pin: "9999",
        player_nickname: "ビリヤード太郎",
        player_count: "1",
        player_gender: "male",
        player_age: "30s",
        player_location: "kanto",
        player_experience: "2年間の経験があります",
        jpa_history: "none",
        player_level: "4",
        player_game_type: "both",
        player_frequency: "1-per-week",
        player_availability: "weekend"
    },
    {
        id: 4,
        title: "チームを探しています",
        content: "ニックネーム: ビリヤード花子\n参加希望人数: 2人\n活動可能地域: 首都圏\nビリヤード歴: 初心者ですが頑張ります\nJPA参加歴: なし",
        author_name: "鈴木花子",
        author_email: "suzuki@example.com",
        post_type: "player-seeking",
        created_at: "2024-09-17T14:20:00Z",
        delete_pin: "1111",
        player_nickname: "ビリヤード花子",
        player_count: "2",
        player_gender: "female",
        player_age: "20s",
        player_location: "capital",
        player_experience: "初心者ですが頑張ります",
        jpa_history: "none",
        player_level: "2",
        player_game_type: "8ball",
        player_frequency: "biweekly",
        player_availability: "weekend"
    },
    // ディビジョン作成
    {
        id: 5,
        title: "ディビジョンを創りたい！",
        content: "活動地域: 東海\n募集チーム数: 3チーム\nプレー種目: どちらでも\n主な活動店舗: ビリヤードOops!\n活動曜日: 土日祝",
        author_name: "高橋一郎",
        author_email: "takahashi@example.com",
        post_type: "division-create",
        created_at: "2024-09-16T11:45:00Z",
        delete_pin: "2222",
        division_location: "tokai",
        division_shop: "ビリヤードOops!",
        division_teams: "3",
        division_game_type: "both",
        division_day: "weekend"
    },
    {
        id: 6,
        title: "ディビジョンを創りたい！",
        content: "活動地域: 九州\n募集チーム数: 2チーム\nプレー種目: 8ボール\n活動曜日: これから決める",
        author_name: "伊藤美咲",
        author_email: "ito@example.com",
        post_type: "division-create",
        created_at: "2024-09-15T16:10:00Z",
        delete_pin: "3333",
        division_location: "kyushu",
        division_teams: "2",
        division_game_type: "8ball",
        division_day: "decide"
    }
];

// 投稿一覧の読み込み
async function loadPosts() {
    try {
        postsList.innerHTML = '<div class="loading">投稿を読み込み中...</div>';
        
        // 実際のAPIを使用（強力なキャッシュバスター付き）
        const cacheBuster = `t=${Date.now()}&r=${Math.random()}`;
        const response = await fetch(`${API_BASE_URL}/api/posts?${cacheBuster}`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const posts = await response.json();
        
        console.log('loadPosts - 取得した投稿数:', posts.length);
        console.log('loadPosts - 投稿データ:', posts);
        
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
    
    const postTypeText = post.post_type === 'team-recruit' ? '🏆 チームメイト募集中！' : 
                        post.post_type === 'player-seeking' ? '👤 チームを探しています' : '🏢 ディビジョンを創りたい！';
    const postTypeClass = post.post_type === 'team-recruit' ? 'team-recruit' : 
                         post.post_type === 'player-seeking' ? 'player-seeking' : 'division-create';
    
    postCard.setAttribute('data-post-id', post.id);
    postCard.innerHTML = `
        <div class="post-type-badge ${postTypeClass}">${postTypeText}</div>
        <div class="post-header">
            <div>
                <h3 class="post-title" onclick="showPostDetail('${post.id}')">${escapeHtml(post.title)}</h3>
                <div class="post-meta">
                    <span>投稿者: ${escapeHtml(getDisplayName(post) || '匿名')}</span>
                    <span class="post-date">${date}</span>
                </div>
            </div>
        </div>
        <div class="post-content">
            ${post.content && post.content.trim() !== '' ? 
                escapeHtml(post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content) : 
                ''
            }
        </div>
        ${createPostDetails(post)}
        <div class="post-actions">
            <button class="btn btn-secondary" onclick="showContactModal('${post.id}', '${escapeHtml(post.title)}', '${post.post_type || 'general'}')">
                連絡する
            </button>
            <button class="btn btn-danger" onclick="showDeleteModal('${post.id}', '${escapeHtml(post.title)}')">削除</button>
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
                    ${post.team_nickname ? `<div class="post-detail-item"><span class="post-detail-label">チーム名・ニックネーム:</span> ${escapeHtml(post.team_nickname)}</div>` : ''}
                    ${post.needed_players ? `<div class="post-detail-item"><span class="post-detail-label">募集人数:</span> ${post.needed_players}名</div>` : ''}
                    ${post.team_location ? `<div class="post-detail-item"><span class="post-detail-label">活動地域:</span> ${getLocationText(post.team_location)}</div>` : ''}
                    ${post.team_jpa_history ? `<div class="post-detail-item"><span class="post-detail-label">JPA参加歴:</span> ${getJpaHistoryText(post.team_jpa_history)}</div>` : ''}
                    ${post.team_skill_level ? `<div class="post-detail-item"><span class="post-detail-label">募集したいスキルレベル:</span> ${getSkillLevelRangeText(post.team_skill_level)}</div>` : ''}
                    ${post.team_game_type ? `<div class="post-detail-item"><span class="post-detail-label">プレー種目:</span> ${getGameTypeText(post.team_game_type)}</div>` : ''}
                    ${post.team_frequency ? `<div class="post-detail-item"><span class="post-detail-label">望む参加頻度:</span> ${getFrequencyTextNew(post.team_frequency)}</div>` : ''}
                    ${post.team_availability ? `<div class="post-detail-item"><span class="post-detail-label">活動曜日:</span> ${escapeHtml(post.team_availability)}</div>` : ''}
                    ${post.team_self_intro ? `<div class="post-detail-item"><span class="post-detail-label">自己紹介:</span> ${escapeHtml(post.team_self_intro)}</div>` : ''}
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
                    ${post.player_location ? `<div class="post-detail-item"><span class="post-detail-label">活動可能地域:</span> ${getLocationText(post.player_location)}</div>` : ''}
                    ${post.player_level ? `<div class="post-detail-item"><span class="post-detail-label">スキルレベル:</span> ${getSkillLevelText(post.player_level)}</div>` : ''}
                    ${post.player_game_type ? `<div class="post-detail-item"><span class="post-detail-label">プレーしたい種目:</span> ${getGameTypeText(post.player_game_type)}</div>` : ''}
                    ${post.player_frequency ? `<div class="post-detail-item"><span class="post-detail-label">参加可能頻度:</span> ${getFrequencyTextNew(post.player_frequency)}</div>` : ''}
                    ${post.player_availability ? `<div class="post-detail-item"><span class="post-detail-label">参加可能曜日:</span> ${escapeHtml(post.player_availability)}</div>` : ''}
                    ${post.jpa_history ? `<div class="post-detail-item"><span class="post-detail-label">JPA参加歴:</span> ${post.jpa_history === 'yes' ? 'あり' : 'なし'}${post.jpa_history_text ? ' (' + escapeHtml(post.jpa_history_text) + ')' : ''}</div>` : ''}
                    ${post.player_self_intro ? `<div class="post-detail-item"><span class="post-detail-label">自己紹介:</span> ${escapeHtml(post.player_self_intro)}</div>` : ''}
                </div>
            </div>
        `;
    } else if (post.post_type === 'division-create') {
        return `
            <div class="post-details">
                <h4>ディビジョン情報</h4>
                <div class="post-details-grid">
                    ${post.division_location ? `<div class="post-detail-item"><span class="post-detail-label">活動地域:</span> ${getLocationText(post.division_location)}</div>` : ''}
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

// 地域テキストの取得
function getLocationText(location) {
    const locationMap = {
        'hokkaido': '北海道',
        'tohoku': '東北',
        'kanto': '関東',
        'capital': '首都圏',
        'tokai': '東海',
        'hokuriku': '北陸',
        'kansai': '関西',
        'chugoku': '中国',
        'shikoku': '四国',
        'kyushu': '九州',
        'okinawa': '沖縄'
    };
    return locationMap[location] || location;
}

function getJpaHistoryText(jpaHistory) {
    const jpaHistoryMap = {
        'participating': '参加中',
        'suspended': '参加していたが現在は活動休止中',
        'planned': 'これから参加予定'
    };
    return jpaHistoryMap[jpaHistory] || jpaHistory;
}

function getSkillLevelRangeText(skillLevel) {
    const skillLevelMap = {
        '1-3': '1〜3',
        '3-4': '3〜4',
        '4-5': '4〜5',
        '5-7': '5〜7',
        '7-9': '7〜9',
        '9': '9'
    };
    return skillLevelMap[skillLevel] || skillLevel;
}

// 表示用名前の取得
function getDisplayName(post) {
    console.log('getDisplayName called with post:', post);
    console.log('post_type:', post.post_type);
    console.log('team_nickname:', post.team_nickname);
    console.log('player_nickname:', post.player_nickname);
    console.log('author_name:', post.author_name);
    
    if (post.post_type === 'team-recruit' && post.team_nickname) {
        return post.team_nickname;
    } else if (post.post_type === 'player-seeking' && post.player_nickname) {
        return post.player_nickname;
    }
    return post.author_name || '匿名';
}

// 投稿詳細の表示
async function showPostDetail(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
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
                <p><strong>投稿者:</strong> ${escapeHtml(getDisplayName(post) || '匿名')}</p>
                <p><strong>投稿日時:</strong> ${date}</p>
            </div>
            ${createPostDetails(post)}
            <div style="margin-top: 1.5rem;">
                <button class="btn btn-secondary" onclick="showContactModal('${post.id}', '${escapeHtml(post.title)}', '${post.post_type || 'general'}')">
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
    
    // チームメイト募集人数の処理
    let neededPlayers = formData.get('neededPlayers');
    if (neededPlayers === 'other') {
        neededPlayers = formData.get('neededPlayersOtherText');
    }
    
    // 活動曜日の処理
    let teamAvailability = formData.get('teamAvailability');
    if (teamAvailability === 'other') {
        teamAvailability = formData.get('teamAvailabilityOtherText');
    }
    
    const postData = {
        title: `チームメイト募集中`,
        content: `チーム名・ニックネーム: ${formData.get('teamNickname') || '未設定'}\n募集人数: ${neededPlayers}\n活動地域: ${formData.get('teamLocation')}\nJPA参加歴: ${getJpaHistoryText(formData.get('teamJpaHistory'))}\n募集スキルレベル: ${getSkillLevelRangeText(formData.get('teamSkillLevel'))}\nプレー種目: ${getGameTypeText(formData.get('teamGameType'))}\n希望参加頻度: ${getFrequencyTextNew(formData.get('teamFrequency'))}\n活動曜日: ${teamAvailability || '未設定'}\n自己紹介: ${formData.get('teamSelfIntro') || '未設定'}`,
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'team-recruit',
        delete_pin: formData.get('teamPin'),
        team_nickname: formData.get('teamNickname'),
        needed_players: neededPlayers,
        team_location: formData.get('teamLocation'),
        team_jpa_history: formData.get('teamJpaHistory'),
        team_skill_level: formData.get('teamSkillLevel'),
        team_game_type: formData.get('teamGameType'),
        team_frequency: formData.get('teamFrequency'),
        team_availability: teamAvailability,
        team_self_intro: formData.get('teamSelfIntro')
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
    
    console.log('Player seeking form data:', {
        playerNickname: formData.get('playerNickname'),
        authorName: formData.get('authorName'),
        authorEmail: formData.get('authorEmail')
    });
    
    // 空の値をフィルタリング
    const playerAge = formData.get('playerAge');
    const playerGender = formData.get('playerGender');
    const playerLevel = formData.get('playerLevel');
    const playerGameType = formData.get('playerGameType');
    const playerFrequency = formData.get('playerFrequency');
    
    const postData = {
        title: `チームを探しています`,
        content: `チーム加入を希望しています。`,
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'player-seeking',
        delete_pin: formData.get('playerPin'),
        player_nickname: formData.get('playerNickname'),
        player_count: playerCount,
        player_gender: playerGender && playerGender !== '' ? playerGender : null,
        player_age: playerAge && playerAge !== '' ? playerAge : null,
        player_location: formData.get('playerLocation'),
        player_experience: formData.get('playerExperience'),
        jpa_history: jpaHistory,
        jpa_history_text: jpaHistoryText,
        player_level: playerLevel && playerLevel !== '' ? playerLevel : null,
        player_game_type: playerGameType && playerGameType !== '' ? playerGameType : null,
        player_frequency: playerFrequency && playerFrequency !== '' ? playerFrequency : null,
        player_availability: playerAvailability,
        player_self_intro: formData.get('playerSelfIntro')
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
        title: `ディビジョンを創りたい！`,
        content: `新しいディビジョンの創設を希望しています。`,
        author_name: formData.get('authorName'),
        author_email: formData.get('authorEmail'),
        post_type: 'division-create',
        delete_pin: formData.get('divisionPin'),
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
        const response = await fetch(`${API_BASE_URL}/api/posts`, {
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
        const response = await fetch(`${API_BASE_URL}/api/contact`, {
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
// PIN削除モーダルを表示
function showDeleteModal(postId, postTitle) {
    try {
        const deleteModal = document.getElementById('deleteModal');
        const deletePinInput = document.getElementById('deletePin');
        
        if (!deleteModal || !deletePinInput) {
            console.error('削除モーダルの要素が見つかりません');
            alert('削除モーダルの初期化に失敗しました。ページを再読み込みしてください。');
            return;
        }
        
        // 投稿IDをモーダルに保存
        deleteModal.dataset.postId = postId;
        
        // モーダルを表示
        deleteModal.style.display = 'block';
        deletePinInput.value = '';
        deletePinInput.focus();
        
        console.log('削除モーダルを表示しました。投稿ID:', postId);
    } catch (error) {
        console.error('削除モーダル表示エラー:', error);
        alert('削除モーダルの表示に失敗しました。');
    }
}

// 投稿削除（PIN検証付き）
async function deletePost(postId, pin) {
    try {
        console.log('削除開始:', { postId, pin });
        
        const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pin: pin })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '削除に失敗しました');
        }
        
        const result = await response.json();
        console.log('削除API応答:', result);
        
        // モーダルを閉じる
        document.getElementById('deleteModal').style.display = 'none';
        
        console.log('削除成功、投稿一覧を再読み込み中...');
        
        // 削除された投稿をDOMから直接削除
        const deletedPostElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (deletedPostElement) {
            deletedPostElement.remove();
            console.log('DOMから投稿を削除しました');
        }
        
        // 投稿一覧を再読み込み（強制キャッシュクリア）
        console.log('投稿一覧を再読み込み中...');
        await loadPosts();
        
        console.log('投稿一覧の再読み込み完了');
        
        // 少し待ってからアラート表示
        setTimeout(() => {
            alert('投稿を削除しました。');
        }, 100);
        
    } catch (error) {
        console.error('削除エラー:', error);
        alert('投稿の削除に失敗しました。');
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

// 削除モーダルの初期化（即座に実行）
function initializeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    const deleteForm = document.getElementById('deleteForm');
    const cancelBtn = document.getElementById('cancelDelete');
    
    if (!deleteModal || !deleteForm || !cancelBtn) {
        console.error('削除モーダルの要素が見つかりません');
        return;
    }
    
    // 既存のイベントリスナーを削除
    const newDeleteForm = deleteForm.cloneNode(true);
    deleteForm.parentNode.replaceChild(newDeleteForm, deleteForm);
    
    // 削除フォームのイベントリスナー
    newDeleteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = document.getElementById('deletePin').value;
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            alert('4桁の数字を入力してください。');
            return;
        }
        
        // 投稿IDはdata属性から取得
        const postId = deleteModal.dataset.postId;
        if (postId) {
            deletePost(postId, pin);
        }
    });
    
    // キャンセルボタン
    document.getElementById('cancelDelete').addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });
    
    // モーダルの閉じるボタン
    const closeBtn = deleteModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
        });
    }
    
    // モーダル外クリックで閉じる
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
}

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDeleteModal);
} else {
    initializeDeleteModal();
}
