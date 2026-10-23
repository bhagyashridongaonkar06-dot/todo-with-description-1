const cl = console.log;

const todoForm = document.getElementById("todoForm");
const todo = document.getElementById("todo");
const description = document.getElementById("description");
const isCompleted = document.getElementById("isCompleted");
const addTodo = document.getElementById("addTodo");
const updateTodo = document.getElementById("updateTodo");
const todoContainer = document.getElementById("todoContainer");
const spinner = document.getElementById("spinner");

const base_url = `https://bhagyashri-s-first-database-default-rtdb.firebaseio.com`;
const todo_url = `${base_url}/todowithcheckandContent.json`;

//state management
let localstate = {
  todosArr: [],
  updateid: null,
};

//snackbar

function snackbar(msg, icon) {
  Swal.fire({
    title: msg,
    icon: icon,
    timer: 3000,
  });
}

//spinnerHandler

function spinnerHandler(flag) {
  if (flag) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
}

//show description function

function showDescription(ele) {
  let currentDescription = ele.nextElementSibling;

  let isOpen = currentDescription.classList.contains("show");

  let allDescription = document
    .getElementById("todoContainer")
    .querySelectorAll(".collapse");

  allDescription.forEach((ele) => ele.classList.remove("show"));

  if (!isOpen) {
    currentDescription.classList.add("show");
  }
}

//nestedObjtoArr

function nestedObjtoArr(obj) {
  for (const key in obj) {
    obj[key].id = key;
    localstate.todosArr.unshift(obj[key]);
  }
}

//rendering

function rendering(arr) {
  let res = "";

  arr.forEach((todo) => {
    res += `<li class="list-group-item" id=${todo.id}>
                                <div class="d-flex justify-content-between" onclick="showDescription(this)">
                                    <div>
                                        <input type="checkbox" class="p-2" onclick="event.stopPropagation(); onStatusChange(this)" ${todo.isCompleted ? "checked" : ""}>
                                        <strong>${todo.todoItem}</strong>
                                    </div>

                                    <div>
                                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); onTodoEdit(this)">Edit</button>
                                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); onTodoDelete(this)">Delete</button>
                                    </div>
                                </div>

                                <div class="collapse">
                                    <div class="card-body">
                                       <p>${todo.description}</p>
                                    </div>
                                </div>
                            </li>`;
    // cl(todo.isCompleted)
  });
  todoContainer.innerHTML = res;
}

async function fetchAllTodos() {
  try {
    spinnerHandler(true);
    let api = await fetch(todo_url, {
      method: "GET",
      body: null,
      headers: {
        "content-type": "application/json",
        autho: "JWT Token",
      },
    });

    if (!api.ok) {
      throw new Error(`http : ${api.status}`);
    }
    // cl(api)
    let res1 = await api.json();

    nestedObjtoArr(res1);
    rendering(localstate.todosArr);
  } catch (err) {
    cl(err);
    snackbar(err, "error");
  } finally {
    spinnerHandler();
  }
}

fetchAllTodos();

//create

async function onSubmit(eve) {
  try {
    eve.preventDefault();

    let newTodo = {
      todoItem: todo.value,
      description: description.value,
      isCompleted: isCompleted.value === "yes" ? true : false,
    };
    // cl(newTodo)
    todoForm.reset();
    spinnerHandler(true);

    let res = await fetch(todo_url, {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: {
        "content-type": "application/json",
      },
    });

    let data = await res.json();

    // cl(data)

    newTodo.id = data.name;
    localstate.todosArr.unshift(newTodo);

    let li = document.createElement("li");
    li.className = `list-group-item`;
    li.id = newTodo.id;
    li.innerHTML = `<div class="d-flex justify-content-between" onclick="showDescription(this)">
                                    <div>
                                        <input type="checkbox" class="p-2" onclick="event.stopPropagation(); onStatusChange(this)" ${newTodo.isCompleted ? "checked" : ""}>
                                        <strong>${newTodo.todoItem}</strong>
                                    </div>

                                    <div>
                                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); onTodoEdit(this)">Edit</button>
                                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); onTodoDelete(this)">Delete</button>
                                    </div>
                                </div>

                                <div class="collapse">
                                    <div class="card-body">
                                       <p>${newTodo.description}</p>
                                    </div>
                                </div>`;
    todoContainer.prepend(li);
    snackbar(`New Todo with name ${newTodo.todoItem} created successfully`, 'success')
  } catch (err) {
    cl(err);
    snackbar(err, "error");
  } finally {
    spinnerHandler();
  }
}

function onTodoEdit(ele) {
  let editId = ele.closest("li").id;
  // cl(editId)
  localstate.updateid = editId;

  let editObj = localstate.todosArr.find((e) => e.id === editId);

  todo.value = editObj.todoItem;
  isCompleted.value = editObj.isCompleted ? "yes" : "no";
  description.value = editObj.description;

  addTodo.classList.add("d-none");
  updateTodo.classList.remove("d-none");
}

async function onUpdateTodo() {
  try {
    let updateId = localstate.updateid;
    // cl(updateId)

    let update_url = `${base_url}/todowithcheckandContent/${updateId}.json`;

    let updateObj = {
      todoItem: todo.value,
      isCompleted: isCompleted.value === "yes" ? true : false,
      description: description.value,
      id: updateId,
    };
    spinnerHandler(true);

    let res = await fetch(update_url, {
      method: "PATCH",
      body: JSON.stringify(updateObj),
      headers: {
        "content-type": "application/json",
        autho: "JWT token",
      },
    });

    if (!res.ok) {
      throw new Error(`http : ${res.status}`);
    }

    let data = await res.json();

    let getIdx = localstate.todosArr.findIndex((e) => e.id === updateId);
    localstate.todosArr[getIdx] = updateObj;

    let obj = document.getElementById(updateId);
    obj.innerHTML = `<div class="d-flex justify-content-between" onclick="showDescription(this)">
                                    <div>
                                        <input type="checkbox" class="p-2" onclick="event.stopPropagation(); onStatusChange(this)" ${updateObj.isCompleted ? "checked" : ""}>
                                        <strong>${updateObj.todoItem}</strong>
                                    </div>

                                    <div>
                                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); onTodoEdit(this)">Edit</button>
                                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); onTodoDelete(this)">Delete</button>
                                    </div>
                                </div>

                                <div class="collapse">
                                    <div class="card-body">
                                       <p>${updateObj.description}</p>
                                    </div>
                                </div>`;

    todoForm.reset();
    snackbar(`Todo with name ${updateObj.todoItem} updated successfully`, 'success')
    addTodo.classList.remove("d-none");
    updateTodo.classList.add("d-none");
  } catch (err) {
    cl(err);
    snackbar(err, "error");
  } finally {
    spinnerHandler();
  }
}

//delete

async function onTodoDelete(ele) {
  try {
    let deleteId = ele.closest("li").id;
    // cl(deleteId)
    let delete_url = `${base_url}/todowithcheckandContent/${deleteId}.json`;

    let res = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (res.isConfirmed) {
      spinnerHandler(true);
      let res1 = await fetch(delete_url, {
        method: "DELETE",
        body: null,
        headers: {
          "content-type": "application/json",
          "autho": "JWT token",
        },
      });
      if (!res1.ok) {
        throw new Error(`http : ${res.status}`);
      }

      let res2 = await res1.json();
      // cl(res2)
      let getIdx = localstate.todosArr.findIndex((e) => e.id === deleteId);
      localstate.todosArr.splice(getIdx, 1);

      ele.closest("li").remove();
    }
  } catch (err) {
    cl(err);
    snackbar(err, "error");
  } finally {
    spinnerHandler();
  }
}


//checkstatus

async function onStatusChange(ele){
    try{
        const checkId = ele.closest('li').id
    // cl(checkId)

   let check_url = `${base_url}/todowithcheckandContent/${checkId}.json`

   let checkObj = {
       isCompleted : ele.checked
   }
   cl(ele) 

   let res = await fetch(check_url,{
        method : "PATCH",
        body : JSON.stringify(checkObj),
        headers : {
            "content-type" : "application/json",
            "autho" : "JWT token"
        }
   })

   if(!res.ok){
        throw new Error(`http : ${res.status}`)
   }
   let res1 = await res.json()

    let checkidx = localstate.todosArr.findIndex(e => e.id === checkId)

    localstate.todosArr[checkidx].isCompleted = checkObj.isCompleted

    }catch(err){
        cl(err)
        snackbar(err, 'error')
    }
    finally{
        spinnerHandler()
    }
}

todoForm.addEventListener("submit", onSubmit);
updateTodo.addEventListener("click", onUpdateTodo);
