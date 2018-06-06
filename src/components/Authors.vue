<template>
  <v-container>
    <v-layout row my-3>
      <div class="display-3">Authors & Books</div>
    </v-layout>

    <div center>
      <v-text-field
        center
        prepend-icon="search"
        v-model="search"
        label="Search"
        class="mx-1"
        flat>
      </v-text-field>
    </div>

    <v-layout row mt-1>
      <v-flex xs12 md3 lg2 sm5>
        <v-btn @click="openCreateAuthor" color="accent">
          <v-icon left dark>add</v-icon>
          Add Author
        </v-btn>
      </v-flex>

      <v-flex xs12 md1 lg1 sm5>
        <v-btn @click="orderAlpha" color="accent">
          <v-icon left dark>list</v-icon>
          {{ this.order === 'alpha' ? 'A-Z': 'Z-A' }}
        </v-btn>
      </v-flex>

      <v-flex xs12 md7 lg7 sm1>
      </v-flex>

      <v-flex xs12 md2 lg2 right>
        <v-select
            color="accent"
            :items="itemsByPage"
            v-model="select"
            label="Rows per Page:"
          ></v-select>
      </v-flex>
    </v-layout>

    <v-layout row mt-2>
      <v-expansion-panel popout>
        <v-expansion-panel-content
          v-for="(author,i) in listPaginated(items)"
          :key="i"
          ripple
          hide-actions>

          <div slot="header">
            <div v-html="highlightSearch(`${author.firstName} ${author.lastName}`, author.seachIndex)"
             class="headline"></div>  
          </div>

          <v-card>
            <v-list>
              <v-bottom-sheet v-model="sheet" hide-overlay>
              <v-btn @click="getIdOption(author)" slot="activator" color="accent"> 
                <v-icon dark left>view_headline</v-icon>Options
              </v-btn>
              
              <v-list v-if="options === 'menu'">
                <div>
                  <v-btn @click="openCreateBook" color="accent">
                    <v-icon dark left>book</v-icon>Create new book
                  </v-btn>
                </div>
                <div>
                  <v-btn @click="editOption()" color="accent">
                    <v-icon dark left>edit</v-icon>Edit Author
                  </v-btn>
                </div>
                <div>
                  <v-btn @click="deleteAuthor" color="accent">
                    <v-icon dark left>delete</v-icon>Delete Author
                  </v-btn>
                </div>
              </v-list>

              <v-list v-if="options === 'editauthor'">
                <v-container fluid>
                  <v-layout row>
                    <v-flex xs8>
                      <v-text-field
                        name="firstName"
                        label="First Name"
                        v-model="authorMocked.firstName"
                        single-line>
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex xs8>
                      <v-text-field
                        name="lastName"
                        label="lastName"
                        v-model="authorMocked.lastName"
                        single-line>
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-btn @click="editAuthor()" color="accent">Confirm Edit
                    <v-icon dark right>edit</v-icon>
                  </v-btn>
                </v-container>
              </v-list>

              <v-list v-if="options === 'createauthor'">
                <v-container fluid>
                  <v-layout row>
                    <v-flex xs8>
                      <v-text-field
                        name="firstName"
                        label="First Name"
                        v-model="authorMocked.firstName"
                        single-line>
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex xs8>
                      <v-text-field
                        name="lastName"
                        label="lastName"
                        v-model="authorMocked.lastName"
                        single-line>
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-btn @click="createAuthor()" color="accent">Confirm Add
                    <v-icon dark right>add</v-icon>
                  </v-btn>
                </v-container>
              </v-list>

              <v-list v-if="options === 'createbook'">
                <v-container fluid>
                  <v-layout row>
                    <v-flex xs8>
                      <v-text-field
                        name="title"
                        label="Title"
                        v-model="bookCreated.title"
                        single-line>
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex xs8>
                      <v-text-field
                        name="isbn"
                        label="ISBN"
                        v-model="bookCreated.isbn"
                        single-line>
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-btn @click="createBook(authorMocked)" color="accent">Create Book
                    <v-icon dark right>send</v-icon>
                  </v-btn>
                </v-container>
              </v-list>
            </v-bottom-sheet>
            <v-list-tile v-for="item in authorBooks(author.id)" :key="item.title">
              <v-list-tile-content>
                <v-list-tile-title v-text="item.title"></v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn @click="dialogDelete(item.id)" icon flat>
                  <v-icon color="pink">delete</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>

      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-layout>

  <v-flex my-3 class="text-xs-center">
    <v-pagination :length="length" v-model="page" color="accent" circle></v-pagination>
  </v-flex>

    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-text>Do you want to delete this book?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat="flat" @click.native="dialog = false">No</v-btn>
          <v-btn flat="flat" @click="deleteBook" @click.native="dialog = false">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
  import { AUTHORS_REQUEST, ADD_AUTHOR, DELETE_AUTHOR, EDIT_AUTHOR } from '../store/actions/authors';
  import { BOOKS_REQUEST, ADD_BOOK, DELETE_BOOK } from '../store/actions/books';

  export default {
    data: () => ({
      sheet: false,
      dialog: false,
      authorMocked: {},
      bookCreated: {},
      deletedBook: '',
      options: 'menu',
      search: '',
      page: 1,
      order: 'alpha',
      select: 5,
      itemsByPage: [5, 10, 30],
      length: 0,
      items: [],
    }),
    computed: {
      authors() {
        return this.$store.getters.getAuthors;
      },
      books() {
        return this.$store.getters.getBooks;
      },
    },
    watch: {
      authors() {
        this.items = this.searchByWord(this.authors);
        this.length = parseInt((this.items.length / this.select) + 1, 10);
      },
      sheet(New) {
        if (New && this.options !== 'createauthor') {
          this.options = 'menu';
        } else {
          this.bookCreated = {};
        }
      },
      search() {
        this.items = this.searchByWord(this.authors);
        this.length = parseInt((this.items.length / this.select) + 1, 10);
      },
      order() {
        this.items = this.searchByWord(this.authors);
        this.length = parseInt((this.items.length / this.select) + 1, 10);
      },
      select() {
        this.items = this.searchByWord(this.authors);
        this.length = parseInt((this.items.length / this.select) + 1, 10);
        this.page = 1;
      },
    },
    mounted() {
      this.$store.dispatch(AUTHORS_REQUEST);
      this.$store.dispatch(BOOKS_REQUEST);
    },
    methods: {
      editOption() {
        this.options = 'editauthor';
      },
      getIdOption(author) {
        const obj = {
          firstName: author.firstName,
          lastName: author.lastName,
          id: author.id,
        };
        this.authorMocked = obj;
        this.options = 'menu';
      },
      deleteAuthor() {
        this.$store.dispatch(DELETE_AUTHOR, this.authorMocked.id).then(() => {
          this.vm.$forceUpdate();
        });
        this.sheet = false;
      },
      createAuthor() {
        this.$store.dispatch(ADD_AUTHOR, this.authorMocked).then(() => {
          this.vm.$forceUpdate();
        });
        this.sheet = false;
      },
      editAuthor() {
        this.$store.dispatch(EDIT_AUTHOR, this.authorMocked).then(() => {
          this.vm.$forceUpdate();
        });
        this.sheet = false;
      },
      authorBooks(id) {
        const bookByAuthor = [];
        this.books.forEach((book) => {
          if (book.authorId === id) {
            bookByAuthor.push(book);
          }
        });
        return bookByAuthor;
      },
      openCreateAuthor() {
        this.sheet = true;
        this.authorMocked = {};
        this.options = 'createauthor';
      },
      openCreateBook() {
        this.options = 'createbook';
      },
      createBook(author) {
        const book = {
          title: this.bookCreated.title,
          isbn: this.bookCreated.isbn,
          authorId: author.id,
        };
        this.$store.dispatch(ADD_BOOK, book).then(() => {
          this.vm.$forceUpdate();
        });
        this.sheet = false;
      },
      dialogDelete(id) {
        this.dialog = true;
        this.deletedBook = id;
      },
      deleteBook() {
        this.$store.dispatch(DELETE_BOOK, this.deletedBook).then(() => {
          this.vm.$forceUpdate();
        });
        this.sheet = false;
      },
      searchByWord(list) {
        const newList = [];
        list.forEach((item) => {
          const name = `${item.firstName} ${item.lastName}`;
          const regex = new RegExp(this.search, 'i');
          if (name.match(regex)) {
            const newItem = item;
            newItem.seachIndex = name.match(regex).index;
            newList.push(item);
          }
        });
        return this.ordering(newList);
      },
      ordering(list) {
        const compareString = (a, b) => a.firstName.localeCompare(b.firstName);
        if (this.order === 'alpha') {
          return list.sort(compareString);
        }
        return list.sort(compareString).reverse();
      },
      orderAlpha() {
        if (this.order === 'alpha') {
          this.order = 'reverse';
        } else {
          this.order = 'alpha';
        }
      },
      listPaginated(list) {
        return list.slice((this.page - 1) * this.select, this.page * this.select);
      },
      highlightSearch(name, index) {
        const piece = name.substr(index, this.search.length);
        if (this.search.length > 0) {
          return name.replace(piece, `<mark>${piece}</mark>`);
        }
        return name;
      },
    },
  };
</script>

<style scoped>
</style>
