import {useProjectStore} from "~/stores/useProjectStore";

export const createEditorOptions = (teamMembers) => {
    const projectStore = useProjectStore();
    const route = useRoute();
    const toolbarOptions = [
        [{'header': [1, 2, 3, 4, 5, 6, false]}],
        ['bold', 'italic', 'underline', 'strike', {'color': []}, {'background': ["#dc3545", "#d63384", "#ffc107", "#20c997", "#007bff", "#6f42c1", "#17a2b8", "#6610f2", "#fd7e14", "#e83e8c", "#28a745", "#343a40", "#c678dd", "#5c6370", "#98c379", "#d19a66", "#61afef"]}],
        ['link'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['blockquote', 'code-block'],
        [{'align': []}, {'indent': '-1'}, {'indent': '+1'}],
    ];
    return {
        modules: {
            toolbar: toolbarOptions,
            mention: {
                dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target', 'disabled', 'color'],
                allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
                mentionDenotationChars: ["@", "#"],
                isolateCharacter: true,
                spaceAfterInsert: true,
                source: (searchTerm, renderList, mentionChar) => {
                    const members = ref([]);

                    if (mentionChar === "@") {
                        if (route.name === "your-work") {
                            members.value = teamMembers.value.teamMembers.map((member) => ({
                                value: member.name,
                                photo: member.url_photo,
                                id: member.id,
                            }));
                        } else {
                            members.value = teamMembers.value.teamMember.map((member) => ({
                                value: member.user.name,
                                photo: member.user.url_photo,
                                id: member.user.id,
                            }));
                        }
                    } else {
                        members.value = [];
                    }

                    if (searchTerm.length === 0) {
                        renderList(members.value, searchTerm, (item) => ({
                            value: item.value,
                            photo: item.url_photo,
                            id: item.id,
                        }));
                    } else {
                        const matches = members.value.filter((item) =>
                            item.value.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        renderList(matches, searchTerm, (item) => ({
                            value: item.value,
                            photo: item.url_photo,
                            id: item.id,
                        }));
                    }
                },
                onSelect: function (item, insertItem) {
                    // projectStore.mentionedUserIds.add(item.id);
                    insertItem(item)
                    // console.log([...projectStore.mentionedUserIds])
                },
                renderItem: (item) => {
                    return `
                        <div class="mention-item truncate" style="max-width: 180px;">
                          <span>${item.value}</span>
                        </div>`;
                },
            }
        },
    };
};

// <img v-if="${item.photo}" src="${item.photo}" alt="User Photo" className="mention-photo" />
// imageResize: {
//     displaySize: true
// },
// <!--              <img v-if="item.photo" src="${item.photo}" alt="User Photo" class="mention-photo" />-->
// const hashValues = [
//     {id: 3, value: "Fredrik Sundqvist 2"},
//     {id: 4, value: "Patrik Sjölin 2"},
// ];
