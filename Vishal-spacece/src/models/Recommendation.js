export class Recommendation {
    constructor(
        recommendationId,
        childId,
        recommendationText
    ) {
        this.recommendationId = recommendationId;
        this.childId = childId;
        this.recommendationText = recommendationText;
    }
}