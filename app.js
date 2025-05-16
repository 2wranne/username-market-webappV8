// Global variables
let userData = {};
let usernames = [];
let invitedFriends = [];

// Initialize the app when Telegram WebApp is ready
function initApp() {
    // Check if we're in Telegram WebView
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.expand();
        Telegram.WebApp.enableClosingConfirmation();
        
        // Get user data from Telegram
        const tgUser = Telegram.WebApp.initDataUnsafe.user;
        userData = {
            id: tgUser.id,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name || '',
            username: tgUser.username || 'no_username',
            photoUrl: tgUser.photo_url
        };
        
        // Load user data
        loadUserData();
        loadUsernames();
        loadInvitedFriends();
        
        // Setup navigation
        setupNavigation();
    } else {
        // For testing outside Telegram
        userData = {
            id: 123456,
            firstName: "John",
            lastName: "Doe",
            username: "johndoe",
            photoUrl: null
        };
        
        // Mock data
        mockData();
        setupNavigation();
    }
}

// Load user data from your backend
async function loadUserData() {
    try {
        // In a real app, you would fetch this from your backend
        const response = await fetch(`/api/user/${userData.id}`);
        const data = await response.json();
        
        // Update UI
        document.getElementById('balance').textContent = `${data.balance.toFixed(2)} RUB`;
        document.getElementById('profile-balance').textContent = `${data.balance.toFixed(2)} RUB`;
        
        // Update profile
        document.getElementById('user-name').textContent = `${userData.firstName} ${userData.lastName}`;
        document.getElementById('user-username').textContent = `@${userData.username}`;
        
        if (userData.photoUrl) {
            document.getElementById('user-avatar').innerHTML = `<img src="${userData.photoUrl}" alt="Profile Photo">`;
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// Load available usernames
async function loadUsernames() {
    try {
        // In a real app, you would fetch this from your backend
        const response = await fetch('/api/usernames');
        usernames = await response.json();
        
        // Update UI
        const usernamesList = document.getElementById('usernames-list');
        usernamesList.innerHTML = '';
        
        if (usernames.length > 0) {
            usernames.forEach(username => {
                const item = document.createElement('div');
                item.className = 'username-item';
                item.innerHTML = `
                    <span>@${username.name}</span>
                    <span class="username-price">${username.price.toFixed(2)} RUB</span>
                `;
                item.addEventListener('click', () => showUsernameDetails(username));
                usernamesList.appendChild(item);
            });
        } else {
            usernamesList.innerHTML = '<div style="text-align: center; padding: 16px 0; color: #666;">No usernames available</div>';
        }
    } catch (error) {
        console.error("Error loading usernames:", error);
    }
}

// Load invited friends
async function loadInvitedFriends() {
    try {
        // In a real app, you would fetch this from your backend
        const response = await fetch(`/api/user/${userData.id}/referrals`);
        invitedFriends = await response.json();
        
        // Update UI
        const invitedList = document.getElementById('invited-list');
        
        if (invitedFriends.length > 0) {
            invitedList.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 8px;">
                    <span>User</span>
                    <span>Profit</span>
                </div>
            `;
            
            invitedFriends.forEach(friend => {
                const item = document.createElement('div');
                item.className = 'inventory-item';
                item.innerHTML = `
                    <span>${friend.name}</span>
                    <span>${friend.profit.toFixed(2)} RUB</span>
                `;
                invitedList.appendChild(item);
            });
        }
    } catch (error) {
        console.error("Error loading invited friends:", error);
    }
}

// Setup navigation between pages
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show the selected page
            const page = item.getAttribute('data-page');
            document.getElementById('main-page').style.display = 'none';
            document.getElementById('invite-page').style.display = 'none';
            document.getElementById('profile-page').style.display = 'none';
            document.getElementById(`${page}-page`).style.display = 'block';
        });
    });
    
    // Setup invite button
    document.getElementById('invite-button').addEventListener('click', () => {
        if (window.Telegram && Telegram.WebApp) {
            // In Telegram, copy the invite link
            const inviteLink = `https://t.me/${Telegram.WebApp.initDataUnsafe.user.username}?start=ref_${userData.id}`;
            Telegram.WebApp.sendData(JSON.stringify({
                action: 'copy_invite',
                link: inviteLink
            }));
        } else {
            // For testing outside Telegram
            alert('Invite link copied to clipboard');
        }
    });
}

// Show username details (for purchase)
function showUsernameDetails(username) {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({
            action: 'view_username',
            username: username.name,
            price: username.price
        }));
    } else {
        alert(`You selected @${username.name} for ${username.price.toFixed(2)} RUB`);
    }
}

// Mock data for testing outside Telegram
function mockData() {
    // Mock user balance
    document.getElementById('balance').textContent = '1250.50 RUB';
    document.getElementById('profile-balance').textContent = '1250.50 RUB';
    
    // Mock profile
    document.getElementById('user-name').textContent = `${userData.firstName} ${userData.lastName}`;
    document.getElementById('user-username').textContent = `@${userData.username}`;
    
    // Mock usernames
    usernames = [
        { name: 'coolusername', price: 500 },
        { name: 'business', price: 1200 },
        { name: 'premium', price: 750 },
        { name: 'topvalue', price: 300 },
        { name: 'exclusive', price: 1500 }
    ];
    
    const usernamesList = document.getElementById('usernames-list');
    usernamesList.innerHTML = '';
    
    usernames.forEach(username => {
        const item = document.createElement('div');
        item.className = 'username-item';
        item.innerHTML = `
            <span>@${username.name}</span>
            <span class="username-price">${username.price.toFixed(2)} RUB</span>
        `;
        item.addEventListener('click', () => showUsernameDetails(username));
        usernamesList.appendChild(item);
    });
    
    // Mock inventory
    const inventory = [
        { name: 'myoldnick', price: 200 },
        { name: 'forsale', price: 350 }
    ];
    
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';
    
    if (inventory.length > 0) {
        inventory.forEach(item => {
            const elem = document.createElement('div');
            elem.className = 'inventory-item';
            elem.innerHTML = `
                <span>@${item.name}</span>
                <span>${item.price.toFixed(2)} RUB</span>
            `;
            inventoryList.appendChild(elem);
        });
    }
    
    // Mock invited friends
    invitedFriends = [
        { name: 'Alice', profit: 125.50 },
        { name: 'Bob', profit: 80.00 }
    ];
    
    const invitedList = document.getElementById('invited-list');
    invitedList.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 8px;">
            <span>User</span>
            <span>Profit</span>
        </div>
    `;
    
    invitedFriends.forEach(friend => {
        const item = document.createElement('div');
        item.className = 'inventory-item';
        item.innerHTML = `
            <span>${friend.name}</span>
            <span>${friend.profit.toFixed(2)} RUB</span>
        `;
        invitedList.appendChild(item);
    });
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', initApp);