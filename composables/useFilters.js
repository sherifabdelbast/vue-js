export function useFilters() {
    const route = useRoute();

    const filterArray = reactive({
        search: ref(route.query.search || ''),
        assignee: ref(route.query.assignee || ''),
        status: ref(route.query.status || ''),
        project: ref(route.query.project || ''),
        sprint: ref(route.query.sprint || ''),
        label: ref(route.query.label || ''),
    });
    const filters = ref([]);

    const getFilters = () => {
        watch(() => route.query, (newQuery) => {
            if (newQuery.search) filters.value.push(`search=${newQuery.search}`);
            if (newQuery.assignee) filters.value.push(`assignee=${newQuery.assignee}`);
            if (newQuery.status) filters.value.push(`status=${newQuery.status}`);
            if (newQuery.project) filters.value.push(`project_id=${newQuery.project}`);
            if (newQuery.sprint) filters.value.push(`sprint=${newQuery.sprint}`);
            if (newQuery.label) filters.value.push(`label=${newQuery.label}`);

            if (Object.keys(route.query).length === 0) {
                filters.value.length = 0;
            }
            return filters.value;
        });

        if (filterArray.search) filters.value.push(`search=${filterArray.search}`);
        if (filterArray.assignee) filters.value.push(`assignee=${filterArray.assignee}`);
        if (filterArray.status) filters.value.push(`status=${filterArray.status}`);
        if (filterArray.project) filters.value.push(`project_id=${filterArray.project}`);
        if (filterArray.sprint) filters.value.push(`sprint=${filterArray.sprint}`);
        if (filterArray.label) filters.value.push(`label=${filterArray.label}`);

        if (Object.keys(route.query).length === 0) {
            filters.value.length = 0;
        }
        return filters.value;
    };

    return {
        getFilters
    };
}