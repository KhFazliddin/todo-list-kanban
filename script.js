(function() {
    let UI = {
        elBoard: document.getElementById('board'),
        elTotalCardCount: document.getElementById('totalCards'),
        elCardPlaceholder: null,
      },
      lists = [],
      todos = [],
      isDragging = false,
      _listCounter = 0, 
      _cardCounter = 0; 
  
    function live(eventType, selector, callback) {
      document.addEventListener(eventType, function (e) {
        if (e.target.webkitMatchesSelector(selector)) {
          callback.call(e.target, e);
        }
      }, false);
    }
    
    live('dragstart', '.list .card', function (e) {
      isDragging = true;
      e.dataTransfer.setData('text/plain', e.target.dataset.id);
      e.dataTransfer.dropEffect = "copy";
      e.target.classList.add('dragging');
    });
    live('dragend', '.list .card', function (e) {
      this.classList.remove('dragging');
      UI.elCardPlaceholder && UI.elCardPlaceholder.remove();
      UI.elCardPlaceholder = null;
      isDragging = false;
    });
  
    live('dragover', '.list, .list .card, .list .card-placeholder', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if(this.className === "list") { // List
        this.appendChild(getCardPlaceholder());
      } else if(this.className.indexOf('card') !== -1) { 
        this.parentNode.insertBefore(getCardPlaceholder(), this);
      }
    });
    
    live('drop', '.list, .list .card-placeholder', function (e) {
      e.preventDefault();
      if(!isDragging) return false;
      let todo_id = +e.dataTransfer.getData('text');
      let todo = getTodo({_id: todo_id});
      let newListID = null; 
      if(this.className === 'list') { 
        newListID = this.dataset.id;
        this.appendChild(todo.dom);
      } else { 
        newListID = this.parentNode.dataset.id;
        this.parentNode.replaceChild(todo.dom, this);
      }
      moveCard(todo_id, +newListID);
    });
    
    function createCard(text, listID, index) {
      if(!text || text === '') return false;
      let newCardId = ++_cardCounter;
      let card = document.createElement("div");
      let list = getList({_id: listID});
      card.draggable = true;
      card.dataset.id = newCardId;
      card.dataset.listId = listID;
      card.id = 'todo_'+newCardId;
      card.className = 'card';
      card.innerHTML = text.trim();
      let todo = {
        _id: newCardId,
        listID: listID,
        text: text,
        dom: card,
        index: index || list.cards+1 
      };
      todos.push(todo);
      
      ++list.cards;
      
      return card;
    }
    
    
    function addTodo(text, listID, index, updateCounters) {
      listID = listID || 1;
      if(!text) return false;
      let list = document.getElementById('list_'+listID);
      let card = createCard(text, listID, index);
      if(index) {
        list.insertBefore(card, list.children[index]);
      } else {
        list.appendChild(card);
      }
      if(updateCounters !== false) updateCardCounts();
    }
    
    function addList(name) {
      name = name.trim();
      if(!name || name === '') return false;
      let newListID = ++_listCounter;
      let list = document.createElement("div");
      let heading = document.createElement("h3");
      let listCounter = document.createElement("span");
      
      list.dataset.id = newListID;
      list.id = 'list_'+newListID;
      list.className = "list";
      list.appendChild(heading);
      
      heading.className = "listname";
      heading.innerHTML = name;
      heading.appendChild(listCounter)
      
      listCounter.innerHTML = 0;
      
      lists.push({
        _id: newListID,
        name: name,
        cards: 0,
        elCounter: listCounter
      });
      
      UI.elBoard.append(list);
    }
    
    function getList (obj) {
      return _.find(lists, obj);
    }
    
    function getTodo (obj) {
      return _.find(todos, obj);
    }
    
    function updateCardCounts (listArray) {
      UI.elTotalCardCount.innerHTML = 'Total Projects: '+todos.length;
      lists.map(function (list) {
        list.elCounter.innerHTML = list.cards;
      })
    }
    
    function moveCard(cardId, newListId, index) {
      if(!cardId) return false;
      try {
        var card = getTodo({_id: cardId});
        if(card.listID !== newListId) { 
          --getList({_id: card.listID}).cards;
          card.listID = newListId;
          ++getList({_id: newListId}).cards;
          updateCardCounts();
        }
      
        if(index){
          card.index = index;
        }
        
      } catch (e) {
        console.log(e.message)
      }
    }
    
    live('submit', '#frmAddTodo', function (e) {
      e.preventDefault();
      addTodo(_.trim(this.todo_text.value));
      this.reset();
      return false;
    });
    
    
    function getCardPlaceholder () {
      if(!UI.elCardPlaceholder) { 
        UI.elCardPlaceholder = document.createElement('div');
        UI.elCardPlaceholder.className = "card-placeholder";
      }
      return UI.elCardPlaceholder;
    }
    
    function init () {
      addList('Todo');
      addList('In Progress');
      addList('Done');
      addTodo('Card 1', 1, null, false);
      addTodo('Card 2', 1, null, false);
      addTodo('Card 3', 1, 2, false);
      addTodo('Card 4', 1, null, false);
  
      updateCardCounts();
      
      moveCard(2, 1, 3);
    }
  
    document.addEventListener("DOMContentLoaded", function() {
      init();
    });
    
  })();
  
    