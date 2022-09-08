
const domain = "https://nodes-on-nodes-challenge.herokuapp.com/nodes/"
const initId = '089ef556-dfff-4ff2-9733-654645be56fe'

/* 
type map = {
    [id]: {
        parent_node_ids: [string],
        children_node_ids: [string],
    }
}
*/
const map = {}

// fetch all children data for a given array of node ids
async function getChildren(ids) {
    const result = await fetch(domain + ids.join(','))
    return await result.json()
}

// recursively add data to the map
async function addDataToMap(ids) {
    let childrenData = await getChildren([ids])
    let arr = []
    childrenData.forEach(childData => {
        let {id, child_node_ids} = childData
        if(!map[id]) {
            map[id] = {child_node_ids: child_node_ids, parent_node_ids: []}
        } else {
            map[id].child_node_ids = getUniq([...map[id].child_node_ids, ...child_node_ids])
        }
        child_node_ids.forEach(child_id => {
            if(!map[child_id]) {
                map[child_id] = {child_node_ids: [], parent_node_ids: [id]}
            } else {
                map[child_id].parent_node_ids = getUniq([...map[child_id].parent_node_ids, id])
            }
            arr.push(child_id)
        })
    })
    if(arr.length !== 0) {
        await addDataToMap(getUniq(arr))
    }
}

async function main() {
    let ids = [initId]
    await addDataToMap(ids)
    const allUniqIds = Object.keys(map)
    let maxConnectionCount = 0
    let nodeWithMaxConnections = ""
    allUniqIds.forEach(id => {
        let child_id_count = map[id].child_node_ids.length
        let parent_id_count = map[id].parent_node_ids.length
        let total_count = child_id_count + parent_id_count

        if(total_count > maxConnectionCount) {
            maxConnectionCount = total_count
            nodeWithMaxConnections = id
        }
    })
    const result = {
        uniqIdsCount: allUniqIds.length,
        maxConnectionCount: maxConnectionCount,
        nodeWithMaxConnections: nodeWithMaxConnections
    }

    console.log(result)
    return result
}

// helper function
function getUniq(array) {
    return [...new Set(array)]
}


main()
