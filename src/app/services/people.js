const { api } = require("./api");
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const peopleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addPerson: builder.mutation({
      queryFn: async (body) => {
        try {
          const docRef = await addDoc(collection(db, "people"), body);
          console.log("Document written with ID: ", docRef.id);
          return { data: { ...body, id: docRef.id } };
        } catch (error) {
          console.error("Error adding person:", error);
          throw error;
        }
      },
      invalidatesTags: ["People"],
    }),
    getPeople: builder.query({
      query: () => "/people",
      providesTags: ["People"],
    }),
  }),
});

export const {
  useAddPersonMutation,
  useGetPeopleQuery,
  useLazyGetPeopleQuery,
} = peopleApi;

export default peopleApi;
