function Product(props){
    const {productObj}=props;

    return(
        <div className="shadow-2xl p-5 rounded-2xl">
            <h2 className="text-2xl">{productObj.title}</h2>
            <p className="font-bold">{productObj.price}</p>
            <p className="font-bold">{productObj.description}</p>
        </div>
    )
}
export default Product;