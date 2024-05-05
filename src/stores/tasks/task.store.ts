import { v4 as uuidv4 } from 'uuid';
import { StateCreator, create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Task, TaskStatus } from '../../interfaces';
// import { produce } from 'immer';
import { immer } from 'zustand/middleware/immer';

interface TaskState {
    tasks: Record<string, Task>;
    draggingTaskId?: string;
    getTaskByStatus: (status: TaskStatus) => Task[];
    addTask: (title: string, status: TaskStatus) => void;
    //TODO: esto se deberá pasar a un store separado
    setDraggingTaskId: (taskId: string) => void;
    removeDraggingTaskId: () => void;
    changeTaskStatus: (taskId: string, status: TaskStatus) => void;
    onTaskDrop: (status: TaskStatus) => void;
}

const storeApi: StateCreator<TaskState, [['zustand/immer', never]]> = (
    set,
    get
) => ({
    tasks: {
        'ABC-1': { id: 'ABC-1', title: 'Task 1', status: 'open' },
        'ABC-2': { id: 'ABC-2', title: 'Task 2', status: 'in-progress' },
        'ABC-3': { id: 'ABC-3', title: 'Task 3', status: 'open' },
        'ABC-4': { id: 'ABC-4', title: 'Task 4', status: 'open' },
    },
    getTaskByStatus: (status: TaskStatus) => {
        /*//^ NOTE:
          //^ Utilizo Object.values(get().tasks) para obtener un array de todas las tareas, 
          //^ luego SÍ filtro por el campo status porque ya es un array y no un objeto.
         */
        const tasks = Object.values(get().tasks).filter(
            (task) => task.status === status
        );
        return tasks;
    },
    //NOTE:se puede poner esta sintaxis de funcion tradicional o la arrow function, son equivalentes
    addTask(title: string, status: TaskStatus) {
        const newTask: Task = {
            id: uuidv4(),
            title,
            status,
        };

        set((state) => {
            state.tasks[newTask.id] = newTask;
        });

        // set(produce((state:TaskState)=>{
        //     state.tasks[newTask.id] = newTask
        // }));

        // set((state) => ({
        //     tasks: {
        //         ...state.tasks,
        //         /* //^NOTE
        //          * Sin corchetes, JavaScript interpretará literalmente task.id como un solo nombre de
        //          * propiedad, en lugar de evaluar el valor de task.id
        //          */
        //         [newTask.id]: newTask, // el nuevo task esté correctamente indexado
        //     },
        // }));

        // set((state)=> ({tasks:{...state.tasks, [newTask.id]:newTask}}))
    },
    setDraggingTaskId: (taskId: string) => {
        set({ draggingTaskId: taskId });
    },
    removeDraggingTaskId: () => {
        set({ draggingTaskId: undefined });
    },
    changeTaskStatus(taskId: string, status: TaskStatus) {
        // const task = {...get().tasks[taskId]};
        // task.status = status;

        // set(state=>{
        //     state.tasks[taskId] = {
        //         ...task
        //         /* state.tasks[taskId],status */
        //     }
        // })

        // segunda FormData, nativa de Zustand
        // set((state) => ({
        //     tasks: {
        //         ...state.tasks,
        //         [taskId]: task,
        //     },
        // }));

        //forma de hacerlo de chat-GPT
        set((state) => {
            const task = state.tasks[taskId]; // Obtén la referencia al borrador
            if (task) {
                task.status = status; // Realiza la modificación en el borrador
            }
        });
    },
    onTaskDrop: (status: TaskStatus) => {
        const taskId = get().draggingTaskId;
        if (!taskId) return;
        get().changeTaskStatus(taskId, status);
        get().removeDraggingTaskId();
    },
});

//^NOTE:
//lo de devtools es para poder ver en devtools del navegador la
//pestaña redux y poder ver ahi las acciones de zustand
export const useTaskStore = create<TaskState>()(
    devtools(persist(immer(storeApi), { name: 'task-store' }))
);

/* //^NOTE
 * 
 * Zustand se basa en un modelo de estado inmutable, lo que básicamente significa que
 * no puedes cambiar directamente el estado, sino que debes crear una nueva copia con
 * los cambios. Ahora, cuando usas el Immer, este te permite trabajar con tu estado 
 * como si fuera mutable en tu función set, pero en realidad el Immer está creando una 
 * copia del estado y aplicando los cambios a esa copia. Entonces, cuando haces el 
 * task.status = status, estás modificando esta copia del Immer, no el estado original. 
 * Al final de la función set, el Immer toma esa copia, lo convierte en una nueva copia 
 * inmutable del estado y eso es lo que se guarda en tu store, por eso parece que puedes 
 * mutar el estado directamente, pero lo que está pasando en realidad es que estás 
 * trabajando con una copia gracias al Immer, sin el Immer, tendrías que hacer una copia 
 * del estado manualmente cada vez que quieras cambiar algo así como la segunda forma 
 * comentada en el codigo de la funcion changeTaskStatus, o sea esta:
 *  set((state) => ({
        tasks: {
            ...state.tasks,
            [taskId]: task,
        },
    }));
 * 
 */

/**@abstract
 * ^ NOTE: Explicacion immer y forma de hacerlo con immer 
    //? (Pregunta) 
    en esta funcion:
    changeTaskStatus(taskId: string, status: TaskStatus) {
        const task = get().tasks[taskId]
        task.status = status;

        set(state=>{
            state.tasks[taskId] = task
        })
    }

    el error está por aqui verdad? dime cual y qué sucede por dentro
    
    //? Respuesta:
    Sí, hay un posible problema con esta función, especialmente considerando el uso de immer en Zustand. Vamos a desglosar la función para identificar el error y explicar por qué podría causar problemas.

    Desglose de la Función
    Obtener el Estado Actual:
    const task = get().tasks[taskId]: Obtienes una referencia a la tarea del estado actual utilizando get().
    Este paso es válido, pero debes tener cuidado de no modificar directamente el objeto que obtuviste.
    Modificar el Estado Directamente:
    task.status = status: Estás intentando cambiar el estado de la tarea directamente. Esto puede ser problemático si el objeto original es inmutable, lo cual es común cuando se usa immer en Zustand.
    Actualizar el Estado con set():
    set(state => { state.tasks[taskId] = task }): Aquí actualizas el estado utilizando immer. Esto está bien, pero el problema es que ya modificaste el objeto task directamente, lo cual podría causar el error "Cannot assign to read-only property" si el objeto task se trata como inmutable.
    Por Qué Puede Ser Problemático
    Cuando utilizas immer en Zustand, las actualizaciones al estado deben realizarse a través de set() y no directamente modificando el estado obtenido a través de get(). Cuando intentas modificar un objeto inmutable, se genera el error mencionado.

    En esta función, el error puede deberse a que intentaste modificar directamente task.status, que podría ser inmutable. Al hacer eso, cualquier intento de actualizar el estado con set() después de modificar un objeto inmutable podría llevar a errores.

    Corrección
    Para corregir este problema, evita modificar directamente el estado. En su lugar, realiza todas las modificaciones dentro de la función set(), como se muestra a continuación:

    typescript
    Copy code
    set((state) => {
    const task = state.tasks[taskId]; // Obtén la referencia al borrador
    if (task) {
        task.status = status; // Realiza la modificación en el borrador
    }
    });
    Aquí, todas las modificaciones se realizan dentro de set(), asegurando que immer pueda mantener la inmutabilidad del estado original y crear una nueva copia del estado con las modificaciones aplicadas. Esto garantiza que el objeto original no se modifique directamente, evitando errores como el que mencionaste.

    Resumen
    Evita modificar directamente el estado obtenido de get().
    Realiza todas las modificaciones dentro de set() para garantizar la inmutabilidad.
    Si necesitas modificar un objeto, asegúrate de hacerlo dentro de un contexto que respete la inmutabilidad, como immer.
 * 
 */
