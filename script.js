// Navegação entre seções
class SabiaApp {
    constructor() {
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupInteractivity();
        this.setupResponsive();
        this.setupConfigurationsSection();
        this.setupCalendar();
        this.setupObservations();
        this.loadInitialData();
    }

    // Configurar navegação
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item a');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetView = item.getAttribute('href').substring(1);
                this.switchView(targetView);
                this.setActiveNav(item.parentElement);
            });
        });
    }

    setupObservations() {
        const addBtn = document.querySelector('.btn-add-observation');
        const form = document.getElementById('newObservationForm');
        const textarea = document.querySelector('.observation-textarea');
        const saveBtn = document.querySelector('.btn-save-observation');
        const cancelBtn = document.querySelector('.btn-cancel-observation');
        const observationsList = document.querySelector('.observations-list');

        // Mostrar formulário para nova observação
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
                if (form.style.display === 'block') {
                    textarea.focus();
                }
            });
        }

        // Cancelar nova observação
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                form.style.display = 'none';
                textarea.value = '';
            });
        }

        // Salvar nova observação
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const text = textarea.value.trim();
                if (text) {
                    this.addObservation(text);
                    textarea.value = '';
                    form.style.display = 'none';
                }
            });
        }

        // Tecla Enter para salvar (Ctrl+Enter)
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    const text = textarea.value.trim();
                    if (text) {
                        this.addObservation(text);
                        textarea.value = '';
                        form.style.display = 'none';
                    }
                }
            });
        }

        // Event delegation para botões de editar e excluir
        if (observationsList) {
            observationsList.addEventListener('click', (e) => {
                if (e.target.closest('.btn-edit-observation')) {
                    const item = e.target.closest('.observation-item');
                    this.editObservation(item);
                } else if (e.target.closest('.btn-delete-observation')) {
                    const item = e.target.closest('.observation-item');
                    this.deleteObservation(item);
                }
            });
        }
    }

    addObservation(text) {
        const observationsList = document.querySelector('.observations-list');
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const observationHTML = `
            <div class="observation-item">
                <div class="observation-content">
                    <div class="observation-text">${text}</div>
                    <div class="observation-meta">
                        <span class="observation-date">${dateStr}</span>
                        <span class="observation-time">${timeStr}</span>
                    </div>
                </div>
                <div class="observation-actions">
                    <button class="btn-edit-observation"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete-observation"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        observationsList.insertAdjacentHTML('afterbegin', observationHTML);
        
        // Salvar no localStorage
        this.saveObservationsToStorage();
    }

    editObservation(item) {
        const textElement = item.querySelector('.observation-text');
        const currentText = textElement.textContent;
        
        // Criar input de edição
        const editInput = document.createElement('textarea');
        editInput.value = currentText;
        editInput.className = 'observation-textarea';
        editInput.style.minHeight = '60px';
        
        // Substituir texto por input
        textElement.style.display = 'none';
        textElement.parentNode.insertBefore(editInput, textElement.nextSibling);
        editInput.focus();
        
        // Criar botões de ação
        const actions = item.querySelector('.observation-actions');
        const originalActions = actions.innerHTML;
        actions.innerHTML = `
            <button class="btn-save-edit"><i class="fas fa-check"></i></button>
            <button class="btn-cancel-edit"><i class="fas fa-times"></i></button>
        `;
        
        // Salvar edição
        const saveBtn = actions.querySelector('.btn-save-edit');
        const cancelBtn = actions.querySelector('.btn-cancel-edit');
        
        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText) {
                textElement.textContent = newText;
                textElement.style.display = 'block';
                editInput.remove();
                actions.innerHTML = originalActions;
                this.saveObservationsToStorage();
            }
        };
        
        const cancelEdit = () => {
            textElement.style.display = 'block';
            editInput.remove();
            actions.innerHTML = originalActions;
        };
        
        saveBtn.addEventListener('click', saveEdit);
        cancelBtn.addEventListener('click', cancelEdit);
        
        // Enter para salvar, Escape para cancelar
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }

    deleteObservation(item) {
        if (confirm('Tem certeza que deseja excluir esta observação?')) {
            item.remove();
            this.saveObservationsToStorage();
        }
    }

    saveObservationsToStorage() {
        const observations = [];
        const items = document.querySelectorAll('.observation-item');
        
        items.forEach(item => {
            const text = item.querySelector('.observation-text').textContent;
            const date = item.querySelector('.observation-date').textContent;
            const time = item.querySelector('.observation-time').textContent;
            
            observations.push({ text, date, time });
        });
        
        localStorage.setItem('sabia_observations', JSON.stringify(observations));
    }

    loadObservationsFromStorage() {
        const stored = localStorage.getItem('sabia_observations');
        if (stored) {
            const observations = JSON.parse(stored);
            const observationsList = document.querySelector('.observations-list');
            
            // Limpar observações existentes (exceto as de exemplo)
            observationsList.innerHTML = '';
            
            // Adicionar observações salvas
            observations.forEach(obs => {
                const observationHTML = `
                    <div class="observation-item">
                        <div class="observation-content">
                            <div class="observation-text">${obs.text}</div>
                            <div class="observation-meta">
                                <span class="observation-date">${obs.date}</span>
                                <span class="observation-time">${obs.time}</span>
                            </div>
                        </div>
                        <div class="observation-actions">
                            <button class="btn-edit-observation"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete-observation"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
                observationsList.insertAdjacentHTML('beforeend', observationHTML);
            });
        }
    }

    // Trocar visualização
    switchView(viewName) {
        // Esconder todas as views
        const allViews = document.querySelectorAll('.content-view');
        allViews.forEach(view => {
            view.classList.remove('active');
        });

        // Mostrar view selecionada
        const targetView = document.getElementById(viewName);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;
        }
    }

    // Definir navegação ativa
    setActiveNav(activeItem) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    // Configurar interatividade
    setupInteractivity() {
        this.setupTimeSlots();
        this.setupExpertiseTags();
        this.setupNotifications();
        this.setupCards();
        this.setupButtons();
    }

    // Configurar slots de horário
    setupTimeSlots() {
        const addSlotButtons = document.querySelectorAll('.btn-add-slot');
        
        addSlotButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.addTimeSlot(button);
            });
        });

        // Tornar slots editáveis
        const timeSlots = document.querySelectorAll('.time-slot.filled');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                this.editTimeSlot(slot);
            });
        });
    }

    // Adicionar novo slot de horário
    addTimeSlot(button) {
        const timeSlots = button.parentElement;
        const newTime = prompt('Digite o horário (ex: 10:00):');
        
        if (newTime && this.isValidTime(newTime)) {
            const newSlot = document.createElement('div');
            newSlot.className = 'time-slot filled';
            newSlot.textContent = newTime;
            newSlot.addEventListener('click', () => {
                this.editTimeSlot(newSlot);
            });
            
            timeSlots.insertBefore(newSlot, button);
            this.animateSlotAdd(newSlot);
        } else if (newTime) {
            alert('Formato de horário inválido. Use o formato HH:MM');
        }
    }

    // Editar slot de horário
    editTimeSlot(slot) {
        const currentTime = slot.textContent;
        const newTime = prompt('Editar horário:', currentTime);
        
        if (newTime && this.isValidTime(newTime)) {
            slot.textContent = newTime;
            this.animateSlotEdit(slot);
        } else if (newTime === '') {
            // Remover slot se vazio
            this.removeTimeSlot(slot);
        } else if (newTime) {
            alert('Formato de horário inválido. Use o formato HH:MM');
        }
    }

    // Remover slot de horário
    removeTimeSlot(slot) {
        slot.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            slot.remove();
        }, 300);
    }

    // Validar formato de horário
    isValidTime(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    // Configurar tags de expertise
    setupExpertiseTags() {
        const addTagButton = document.querySelector('.btn-add-tag');
        const removeTagButtons = document.querySelectorAll('.tag i.fa-times');
        
        if (addTagButton) {
            addTagButton.addEventListener('click', () => {
                this.addExpertiseTag();
            });
        }

        removeTagButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeExpertiseTag(button.parentElement);
            });
        });
    }

    // Adicionar nova tag de expertise
    addExpertiseTag() {
        const tagName = prompt('Digite a nova área de expertise:');
        
        if (tagName && tagName.trim()) {
            const expertiseTags = document.querySelector('.expertise-tags');
            const addButton = document.querySelector('.btn-add-tag');
            
            const newTag = document.createElement('span');
            newTag.className = 'tag';
            newTag.innerHTML = `${tagName.trim()} <i class="fas fa-times"></i>`;
            
            const removeButton = newTag.querySelector('i');
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeExpertiseTag(newTag);
            });
            
            expertiseTags.insertBefore(newTag, addButton);
            this.animateTagAdd(newTag);
        }
    }

    // Remover tag de expertise
    removeExpertiseTag(tag) {
        tag.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            tag.remove();
        }, 300);
    }

    // Configurar notificações
    setupNotifications() {
        const notifications = document.querySelectorAll('.notification-item');
        
        notifications.forEach(notification => {
            notification.addEventListener('click', () => {
                this.markNotificationAsRead(notification);
            });
        });
    }

    // Marcar notificação como lida
    markNotificationAsRead(notification) {
        notification.style.opacity = '0.6';
        notification.style.transform = 'scale(0.98)';
        
        // Simular remoção após 2 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
                this.updateNotificationCount();
            }, 300);
        }, 2000);
    }

    // Atualizar contador de notificações
    updateNotificationCount() {
        const notificationsList = document.querySelector('.notifications-list');
        const remainingNotifications = notificationsList.children.length;
        
        if (remainingNotifications === 0) {
            notificationsList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">Nenhuma notificação pendente</p>';
        }
    }

    // Configurar cards do dashboard
    setupCards() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            card.addEventListener('click', () => {
                this.animateCardClick(card);
            });
        });
    }

    // Configurar botões
    setupButtons() {
        const saveButton = document.querySelector('.btn-save');
        const viewAllButtons = document.querySelectorAll('.btn-link');
        
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveChanges();
            });
        }

        viewAllButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllItems(button);
            });
        });
    }

    // Salvar alterações
    saveChanges() {
        const saveButton = document.querySelector('.btn-save');
        const originalText = saveButton.textContent;
        
        saveButton.textContent = 'Salvando...';
        saveButton.disabled = true;
        
        // Simular salvamento
        setTimeout(() => {
            saveButton.textContent = 'Salvo!';
            saveButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            setTimeout(() => {
                saveButton.textContent = originalText;
                saveButton.disabled = false;
                saveButton.style.background = '';
            }, 2000);
        }, 1500);
    }

    // Mostrar todos os itens
    showAllItems(button) {
        const section = button.closest('.section');
        const sectionTitle = section.querySelector('h2').textContent;
        
        alert(`Visualizando todos os itens de: ${sectionTitle}`);
    }

    // Configurar responsividade
    setupResponsive() {
        this.setupMobileMenu();
        this.handleResize();
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    // Configurar menu mobile
    setupMobileMenu() {
        // Criar botão de menu mobile
        const mobileMenuButton = document.createElement('button');
        mobileMenuButton.className = 'mobile-menu-button';
        mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuButton.style.cssText = `
            display: none;
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 1001;
            background: #1e293b;
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(mobileMenuButton);
        
        mobileMenuButton.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Alternar menu mobile
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
    }

    // Lidar com redimensionamento
    handleResize() {
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const sidebar = document.querySelector('.sidebar');
        
        if (window.innerWidth <= 768) {
            mobileMenuButton.style.display = 'block';
        } else {
            mobileMenuButton.style.display = 'none';
            sidebar.classList.remove('open');
        }
    }

    // Carregar dados iniciais
    loadInitialData() {
        this.updateDashboardData();
        this.loadRecentActivity();
        this.loadObservationsFromStorage();
    }

    // Atualizar dados do dashboard
    updateDashboardData() {
        // Simular atualização de dados em tempo real
        setInterval(() => {
            this.updateEarnings();
            this.updateSessionCount();
        }, 30000); // Atualizar a cada 30 segundos
    }

    // Atualizar ganhos
    updateEarnings() {
        const earningsValue = document.querySelector('.earnings .card-value');
        if (earningsValue) {
            const currentValue = parseFloat(earningsValue.textContent.replace('R$ ', '').replace(',', '.'));
            const newValue = currentValue + (Math.random() * 50 - 25); // Variação aleatória
            earningsValue.textContent = `R$ ${newValue.toFixed(2).replace('.', ',')}`;
        }
    }

    // Atualizar contagem de sessões
    updateSessionCount() {
        const sessionValue = document.querySelector('.sessions .card-value');
        if (sessionValue && Math.random() > 0.8) { // 20% de chance de atualizar
            const currentValue = parseInt(sessionValue.textContent);
            sessionValue.textContent = currentValue + 1;
            this.animateValueUpdate(sessionValue);
        }
    }

    // Carregar atividade recente
    loadRecentActivity() {
        // Simular carregamento de atividades
        setTimeout(() => {
            this.addNewNotification('Nova avaliação recebida', '2 min atrás');
        }, 10000);
    }

    // Adicionar nova notificação
    addNewNotification(message, time) {
        const notificationsList = document.querySelector('.notifications-list');
        
        const newNotification = document.createElement('div');
        newNotification.className = 'notification-item';
        newNotification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="notification-content">
                <p>${message}</p>
                <span class="notification-time">${time}</span>
            </div>
        `;
        
        newNotification.addEventListener('click', () => {
            this.markNotificationAsRead(newNotification);
        });
        
        notificationsList.insertBefore(newNotification, notificationsList.firstChild);
        this.animateNotificationAdd(newNotification);
    }

    // Animações
    animateSlotAdd(slot) {
        slot.style.animation = 'slideIn 0.3s ease';
    }

    animateSlotEdit(slot) {
        slot.style.animation = 'pulse 0.3s ease';
    }

    animateTagAdd(tag) {
        tag.style.animation = 'fadeIn 0.3s ease';
    }

    animateCardClick(card) {
        card.style.animation = 'cardClick 0.2s ease';
        setTimeout(() => {
            card.style.animation = '';
        }, 200);
    }

    animateValueUpdate(element) {
        element.style.animation = 'valueUpdate 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    animateNotificationAdd(notification) {
        notification.style.animation = 'slideInFromTop 0.3s ease';
    }

    // Configurar seção de configurações
    setupConfigurationsSection() {
        // Configurar botão salvar
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveConfigurations();
            });
        }

        // Configurar toggles
        const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.handleToggleChange(e.target);
            });
        });

        // Configurar inputs numéricos
        const numberInputs = document.querySelectorAll('.config-input[type="number"]');
        numberInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleNumberInputChange(e.target);
            });
        });

        // Configurar checkboxes de canais
        const channelCheckboxes = document.querySelectorAll('.channel-option input[type="checkbox"]');
        channelCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleChannelChange(e.target);
            });
        });
    }

    // Manipular mudanças nos toggles
    handleToggleChange(toggle) {
        const configItem = toggle.closest('.config-item');
        const label = configItem.querySelector('.config-label h4');
        const setting = label ? label.textContent : 'Configuração';
        
        console.log(`${setting}: ${toggle.checked ? 'Ativado' : 'Desativado'}`);
        
        // Adicionar feedback visual
        this.showConfigFeedback(`${setting} ${toggle.checked ? 'ativado' : 'desativado'}`);
    }

    // Manipular mudanças nos inputs numéricos
    handleNumberInputChange(input) {
        const configItem = input.closest('.config-item');
        const label = configItem.querySelector('h4');
        const setting = label ? label.textContent : 'Configuração';
        const unit = input.nextElementSibling?.textContent || '';
        
        console.log(`${setting}: ${input.value} ${unit}`);
        
        // Validar valores
        if (input.value < input.min) {
            input.value = input.min;
        } else if (input.value > input.max) {
            input.value = input.max;
        }
        
        this.showConfigFeedback(`${setting} atualizado para ${input.value} ${unit}`);
    }

    // Manipular mudanças nos canais de notificação
    handleChannelChange(checkbox) {
        const channel = checkbox.nextElementSibling.textContent;
        console.log(`Canal ${channel}: ${checkbox.checked ? 'Ativado' : 'Desativado'}`);
        
        this.showConfigFeedback(`Canal ${channel} ${checkbox.checked ? 'ativado' : 'desativado'}`);
    }

    // Salvar configurações
    saveConfigurations() {
        const configurations = this.gatherConfigurations();
        
        // Simular salvamento
        console.log('Salvando configurações:', configurations);
        
        // Mostrar feedback de sucesso
        this.showConfigFeedback('Configurações salvas com sucesso!', 'success');
        
        // Aqui você adicionaria a lógica para enviar para o servidor
        // this.sendConfigurationsToServer(configurations);
    }

    // Coletar todas as configurações
    gatherConfigurations() {
        const config = {
            notifications: {},
            availability: {},
            pricing: {},
            privacy: {},
            channels: []
        };

        // Coletar toggles
        const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        toggles.forEach(toggle => {
            const configItem = toggle.closest('.config-item');
            const label = configItem.querySelector('.config-label h4');
            if (label) {
                const key = this.normalizeKey(label.textContent);
                const section = this.getConfigSection(configItem);
                config[section][key] = toggle.checked;
            }
        });

        // Coletar inputs numéricos
        const numberInputs = document.querySelectorAll('.config-input[type="number"]');
        numberInputs.forEach(input => {
            const configItem = input.closest('.config-item');
            const label = configItem.querySelector('h4');
            if (label) {
                const key = this.normalizeKey(label.textContent);
                const section = this.getConfigSection(configItem);
                config[section][key] = parseInt(input.value);
            }
        });

        // Coletar canais de notificação
        const channelCheckboxes = document.querySelectorAll('.channel-option input[type="checkbox"]');
        channelCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const channel = checkbox.nextElementSibling.textContent;
                config.channels.push(channel);
            }
        });

        return config;
    }

    // Normalizar chave para objeto
    normalizeKey(text) {
        return text.toLowerCase()
                  .replace(/[^a-z0-9\s]/g, '')
                  .replace(/\s+/g, '_');
    }

    // Determinar seção da configuração
    getConfigSection(configItem) {
        const section = configItem.closest('.config-section');
        const sectionTitle = section.querySelector('h2').textContent.toLowerCase();
        
        if (sectionTitle.includes('notificações')) return 'notifications';
        if (sectionTitle.includes('disponibilidade')) return 'availability';
        if (sectionTitle.includes('preços')) return 'pricing';
        if (sectionTitle.includes('privacidade')) return 'privacy';
        
        return 'general';
    }

    // Mostrar feedback de configuração
    showConfigFeedback(message, type = 'info') {
        // Remover feedback anterior se existir
        const existingFeedback = document.querySelector('.config-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Criar novo feedback
        const feedback = document.createElement('div');
        feedback.className = `config-feedback config-feedback-${type}`;
        feedback.textContent = message;
        
        // Adicionar estilos inline
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        document.body.appendChild(feedback);
        
        // Remover após 3 segundos
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => feedback.remove(), 300);
            }
        }, 3000);
    }

    // Configurar calendário
    setupCalendar() {
        this.currentDate = new Date();
        this.generateCalendarGrid();
        this.setupCalendarNavigation();
    }
    
    // Gerar grade do calendário
    generateCalendarGrid() {
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) return;
        
        // Limpar conteúdo existente
        calendarBody.innerHTML = '';
        
        // Gerar células do calendário (10 linhas x 7 colunas)
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-cell';
                cell.style.gridColumn = col + 1;
                cell.style.gridRow = row + 1;
                
                // Adicionar evento de clique para agendamento
                cell.addEventListener('click', (e) => {
                    this.handleCalendarCellClick(e, row, col);
                });
                
                calendarBody.appendChild(cell);
            }
        }
        
        this.updateCalendarHeader();
    }
    
    // Configurar navegação do calendário
    setupCalendarNavigation() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.updateCalendarHeader();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.updateCalendarHeader();
            });
        }
    }
    
    // Atualizar cabeçalho do calendário
    updateCalendarHeader() {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        const currentMonthElement = document.getElementById('currentMonth');
        if (currentMonthElement) {
            currentMonthElement.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }
        
        // Atualizar números dos dias na semana atual
        this.updateWeekDays();
    }
    
    // Atualizar dias da semana
    updateWeekDays() {
        const dayNumbers = document.querySelectorAll('.day-number');
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Segunda-feira
        
        dayNumbers.forEach((dayElement, index) => {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + index);
            dayElement.textContent = currentDay.getDate();
        });
    }
    
    // Lidar com clique na célula do calendário
    handleCalendarCellClick(event, row, col) {
        const timeSlot = row + 8; // 8:00 é a primeira linha
        const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        const dayName = dayNames[col];
        
        // Mostrar modal de agendamento (simulado)
        const confirmed = confirm(`Deseja agendar um horário para ${dayName} às ${timeSlot}:00?`);
        
        if (confirmed) {
            this.createCalendarEvent(row, col, `Novo Agendamento`, `${timeSlot}:00 - ${timeSlot + 1}:00`);
        }
    }
    
    // Criar evento no calendário
    createCalendarEvent(row, col, title, time) {
        const calendarGrid = document.querySelector('.calendar-grid');
        
        const event = document.createElement('div');
        event.className = 'calendar-event';
        event.style.gridColumn = col + 1;
        event.style.gridRow = row + 1;
        event.style.background = '#3b82f6';
        
        event.innerHTML = `
            <div class="event-content">
                <div class="event-title">${title}</div>
                <div class="event-time">${time}</div>
            </div>
        `;
        
        // Adicionar evento de clique para editar/remover
        event.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = confirm('Deseja remover este agendamento?');
            if (action) {
                event.remove();
            }
        });
        
        calendarGrid.appendChild(event);
    }
}

// Adicionar animações CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes cardClick {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
    }
    
    @keyframes valueUpdate {
        0%, 100% { color: inherit; }
        50% { color: #10b981; transform: scale(1.1); }
    }
    
    @keyframes slideInFromTop {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Inicializar aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new SabiaApp();
});

// Adicionar funcionalidades extras
document.addEventListener('DOMContentLoaded', () => {
    // Tooltip para elementos com título
    const elementsWithTooltip = document.querySelectorAll('[title]');
    elementsWithTooltip.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
    
    // Smooth scroll para links internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Lazy loading para imagens (se houver)
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Funções auxiliares para tooltips
function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('title');
    tooltip.style.cssText = `
        position: absolute;
        background: #1e293b;
        color: white;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
    
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 10);
    
    e.target.tooltipElement = tooltip;
    e.target.removeAttribute('title');
}

function hideTooltip(e) {
    if (e.target.tooltipElement) {
        e.target.tooltipElement.remove();
        e.target.setAttribute('title', e.target.tooltipElement.textContent);
        delete e.target.tooltipElement;
    }
}

// Funcionalidade do botão de salvar configurações
function setupSaveConfigButton() {
    const saveBtn = document.getElementById('saveConfigBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simular salvamento (aqui você pode adicionar a lógica real de salvamento)
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            
            setTimeout(() => {
                // Restaurar botão
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
                
                // Mostrar mensagem de sucesso
                showSuccessMessage('Configurações salvas com sucesso!');
            }, 1500);
        });
    }
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage(message) {
    // Remover mensagem anterior se existir
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Criar nova mensagem
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Adicionar ao body
    document.body.appendChild(successDiv);
    
    // Mostrar com animação
    setTimeout(() => {
        successDiv.classList.add('show');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        successDiv.classList.remove('show');
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 400);
    }, 3000);
}

// Funcionalidade do botão de salvar no header de configurações
function setupConfigHeaderSaveButton() {
    const saveBtn = document.getElementById('configHeaderSaveBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simular salvamento
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            
            setTimeout(() => {
                // Restaurar botão
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-save"></i> Salvar';
                
                // Mostrar mensagem de sucesso
                showSuccessMessage('Configurações salvas com sucesso!');
            }, 1200);
        });
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    setupSaveConfigButton();
    setupConfigHeaderSaveButton();
});

// Exportar para uso global se necessário
window.SabiaApp = SabiaApp;