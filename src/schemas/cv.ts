import { z } from "zod";

export const cvAnalysisSchema = z.object({
  params: z.object({
    cvId: z.string().regex(/^\d+$/, "CV ID must be numeric"),
  }),
});

export const analysisRequestSchema = cvAnalysisSchema;
export default {
  cvAnalysisSchema,
  analysisRequestSchema,
};
